import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiButton, TuiDataList, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiSegmented } from '@taiga-ui/kit';
import { Actions, ofType } from '@ngrx/effects';
  import { takeUntil, Subject, switchMap, filter, distinctUntilChanged, of, timeout, finalize } from 'rxjs';
  import { catchError, map } from 'rxjs/operators';
import { crearCompra, crearCompraExito } from '@/app/state/actions/compra.actions';
import { AppState } from '@/app/state/app.state';
import { CompraState } from '@/app/state/reducers/compra.reducer';
import { selectCompra } from '@/app/state/selectors/compra.selectors';
  import { ConsultaService } from '@/app/services/consultas.service';
import { Proveedor } from '@/app/models/proveedor.models';
import { CreateCompra } from '@/app/models/compra.models';
import { loadProveedores } from '@/app/state/actions/proveedor.actions';
import { selectProveedores } from '@/app/state/selectors/proveedor.selectors';
import { Observable } from 'rxjs';
import { parseXmlCompra } from '@/app/utils/xml-parser';

@Component({
  selector: 'app-registrarcompra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiDataList,
    TuiTextfield,
    TuiIcon,
    TuiLoader,
    TuiInputModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiSegmented,
  ],
  templateUrl: './registrarcompra.component.html',
  styleUrl: './registrarcompra.component.scss'
})
export class RegistrarcompraComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private alerts = inject(TuiAlertService);
  private actions$ = inject(Actions);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

   loading$ = this.store.select(selectCompra);
   compraError$ = this.store.select(selectCompra).pipe(
     map((state: CompraState) => state.error?.error || {})
   );
  tipoComprobanteSeleccionado = '';
   pasoActual: number = 1;

   private consultaService = inject(ConsultaService);

  submitted = false;
  consultandoDocumento = false;
  proveedorNoEncontrado = false;
  compraServerError: string | null = null;

  origenProveedor: 'registrados' | 'consulta' = 'registrados';
  proveedores: Proveedor[] = [];
  proveedorRegistradoRuc = '';

  tipoComprobantes = ['01', '03'];
  tipoComprobanteLabels: Record<string, string> = {
    '01': 'Factura',
    '03': 'Boleta'
  };
  monedas = ['PEN', 'USD'];
  formasPago = ['CONTADO', 'CREDITO'];
  formasPagoLabels: Record<string, string> = {
    'CONTADO': 'Contado',
    'CREDITO': 'Credito'
  };
   tiposDocProveedor = ['07', '01'];
   tiposDocProveedorLabels: Record<string, string> = {
     '07': 'RUC',
     '01': 'DNI'
   };

   tiposDocProveedorPermitidos: Record<string, string[]> = {
     '01': ['07'],
     '03': ['07', '01']
   };

   longitudesDocProveedor: Record<string, { min: number; max: number; label: string }> = {
     '01': { min: 8, max: 8, label: 'DNI (8 digitos)' },
     '07': { min: 11, max: 11, label: 'RUC (11 digitos)' }
   };

   archivoFile: File | null = null;
   archivoPdf: File | null = null;
   archivoImagen: File | null = null;
   parseando = false;

  compraForm: FormGroup = this.fb.group({
    tipo_comprobante: ['01', Validators.required],
    serie: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{1,10}$/)]],
    correlativo: ['', [Validators.required, Validators.pattern(/^\d{1,20}$/)]],
    fecha_emision: ['', [Validators.required, this.fechaNoFuturaValidator]],
    forma_pago: ['CONTADO', Validators.required],
    moneda: ['PEN', Validators.required],
    tipo_documento_proveedor: [''],
    numero_documento_proveedor: [''],
    nombre_proveedor: [''],
    documento_relacionado: [''],
    enlace_verificacion: ['', this.urlValidator],
    observaciones: [''],
    items: this.fb.array([], [Validators.required, Validators.minLength(1)]),
  }, { validators: [this.proveedorValidator] });

  ngOnInit() {
     if (this.compraForm.get('tipo_comprobante')?.value === '01') {
       this.compraForm.get('tipo_documento_proveedor')?.setValue('07', { emitEvent: false });
       this.onTipoDocProveedorChange();
     }
     this.store.dispatch(loadProveedores());
     this.store.select(selectProveedores)
       .pipe(takeUntil(this.destroy$))
       .subscribe((state: any) => {
         this.proveedores = state?.proveedores ?? [];
         this.cdr.detectChanges();
       });

     this.compraForm.get('tipo_comprobante')?.valueChanges
       .pipe(takeUntil(this.destroy$))
       .subscribe(() => {
         this.onTipoComprobanteChange();
       });

     this.compraError$
       .pipe(takeUntil(this.destroy$))
       .subscribe((errObj: any) => {
         this.compraServerError = errObj?.detail || errObj?.non_field_errors?.[0] || null;
       });

    this.compraForm.get('tipo_documento_proveedor')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onTipoDocProveedorChange();
      });

    this.compraForm.get('numero_documento_proveedor')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        filter((valor: string) => !!valor && valor.length >= 8)
      )
      .subscribe(() => {
        this.consultarProveedor();
      });
  }

   seleccionarTipoComprobante(tipo: string): void {
     this.tipoComprobanteSeleccionado = tipo;
     this.compraForm.get('tipo_comprobante')?.setValue(tipo, { emitEvent: true });
   }

   pasoSiguiente(): void {
     this.pasoActual++;
   }

    pasoAnterior(): void {
      this.pasoActual--;
    }

    get puedeRegistrar(): boolean {
      return this.compraForm.valid && this.items.length > 0;
    }

   setOrigenProveedor(origen: 'registrados' | 'consulta'): void {
     this.origenProveedor = origen;
     this.proveedorNoEncontrado = false;
     this.proveedorRegistradoRuc = '';
     this.compraForm.patchValue({
       tipo_documento_proveedor: '07',
       numero_documento_proveedor: '',
       nombre_proveedor: '',
     });
   }

   onProveedorRegistradoChange(ruc: string): void {
     const p = this.proveedores.find(x => x.ruc === ruc);
     if (!p) return;
     const doc = (p.ruc || '').trim();
     this.proveedorNoEncontrado = false;
     this.compraForm.patchValue({
       tipo_documento_proveedor: '07',
       numero_documento_proveedor: doc,
       nombre_proveedor: p.nombre || '',
     });
     this.cdr.detectChanges();
   }

   get proveedorRegistradoSeleccionado(): Proveedor | null {
     return this.proveedores.find(x => x.ruc === this.proveedorRegistradoRuc) ?? null;
   }

   consultarProveedor(): void {
     const tipoDoc = this.compraForm.get('tipo_documento_proveedor')?.value;
     const nroDoc = this.compraForm.get('numero_documento_proveedor')?.value;

     if (!tipoDoc || !nroDoc) return;

     const info = this.longitudesDocProveedor[tipoDoc];
     if (!info || nroDoc.length < info.min || nroDoc.length > info.max) return;

     const consultaObservable =
       nroDoc.length === 8
         ? this.consultaService.consultarDNI(nroDoc)
         : nroDoc.length === 11
           ? this.consultaService.consultarRUC(nroDoc)
           : null;

     if (!consultaObservable) return;

     this.consultandoDocumento = true;
     this.proveedorNoEncontrado = false;

     consultaObservable.pipe(
       timeout(5000),
       takeUntil(this.destroy$),
       finalize(() => {
         this.consultandoDocumento = false;
         this.cdr.detectChanges();
       }),
       catchError((error) => {
         console.error('Error al consultar documento:', error);
         this.proveedorNoEncontrado = true;
         return of(null);
       })
     ).subscribe(response => {
       const nombre = response?.nombre_completo || response?.nombre_o_razon_social || '';

       if (nombre) {
         this.proveedorNoEncontrado = false;
         this.compraForm.patchValue({ nombre_proveedor: nombre });
       } else {
         this.proveedorNoEncontrado = true;
         this.compraForm.patchValue({ nombre_proveedor: '' });
       }
      });
   }

   get items(): FormArray {
    return this.compraForm.get('items') as FormArray;
  }

  get itemsControls(): FormGroup[] {
    return this.items.controls as FormGroup[];
  }

  get f() {
    return this.compraForm.controls;
  }

  // ==================== VALIDADORES CUSTOM ====================

  fechaNoFuturaValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const fecha = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return fecha > hoy ? { fechaFutura: true } : null;
  }

  proveedorValidator(group: AbstractControl): ValidationErrors | null {
    const tipoDoc = group.get('tipo_documento_proveedor')?.value;
    const nroDoc = group.get('numero_documento_proveedor')?.value;
    const nombre = group.get('nombre_proveedor')?.value;

    if (tipoDoc && !nroDoc) return { proveedorIncompleto: 'numero' };
    if (nroDoc && !tipoDoc) return { proveedorIncompleto: 'tipo' };
    if ((tipoDoc || nroDoc) && !nombre) return { proveedorIncompleto: 'nombre' };
    return null;
  }

  urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    try {
      new URL(control.value);
      return null;
    } catch {
      return { urlInvalida: true };
    }
  }

  // ==================== VALIDACIONES POR CAMPO ====================

  onTipoComprobanteChange() {
    const tipoDocCtrl = this.compraForm.get('tipo_documento_proveedor');

    // Siempre RUC (07), en boleta y factura
    if (tipoDocCtrl?.value !== '07') {
      tipoDocCtrl?.setValue('07');
    }

    this.compraForm.get('serie')?.updateValueAndValidity();
  }

  onTipoDocProveedorChange() {
    const tipoDoc = this.compraForm.get('tipo_documento_proveedor')?.value;
    const nroDocCtrl = this.compraForm.get('numero_documento_proveedor');

    if (tipoDoc && this.longitudesDocProveedor[tipoDoc]) {
      const { min, max } = this.longitudesDocProveedor[tipoDoc];
      nroDocCtrl?.setValidators([
        Validators.required,
        Validators.minLength(min),
        Validators.maxLength(max),
        Validators.pattern(/^\d+$/)
      ]);
    } else {
      nroDocCtrl?.clearValidators();
    }
    nroDocCtrl?.updateValueAndValidity();
  }

  getSerieError(): string {
    const ctrl = this.f['serie'];
    if (!ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'La serie es obligatoria';
    if (ctrl.errors['pattern']) return 'Formato invalido (ej: F001, B001)';
    return '';
  }

  getCorrelativoError(): string {
    const ctrl = this.f['correlativo'];
    if (!ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'El correlativo es obligatorio';
    if (ctrl.errors['pattern']) return 'Solo numeros permitidos';
    return '';
  }

  getFechaEmisionError(): string {
    const ctrl = this.f['fecha_emision'];
    if (!ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'La fecha de emision es obligatoria';
    if (ctrl.errors['fechaFutura']) return 'La fecha no puede ser futura';
    return '';
  }

  getFormaPagoError(): string {
    const ctrl = this.f['forma_pago'];
    if (!ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'Seleccione una forma de pago';
    return '';
  }

  getNroDocProveedorError(): string {
    const ctrl = this.f['numero_documento_proveedor'];
    if (!ctrl.errors || !ctrl.touched) return '';
    const tipoDoc = this.compraForm.get('tipo_documento_proveedor')?.value;
    const info = this.longitudesDocProveedor[tipoDoc];

    if (ctrl.errors['required']) return 'El numero de documento es obligatorio';
    if (ctrl.errors['minlength'] || ctrl.errors['maxlength']) return info ? `Debe tener ${info.min === info.max ? info.min + ' digitos' : info.min + '-' + info.max + ' caracteres'}` : 'Longitud invalida';
    if (ctrl.errors['pattern']) return 'Solo numeros permitidos';
    return '';
  }

  getNombreProveedorError(): string {
    const ctrl = this.f['nombre_proveedor'];
    if (!ctrl.errors || !ctrl.touched) return '';
    return '';
  }

  getEnlaceVerificacionError(): string {
    const ctrl = this.f['enlace_verificacion'];
    if (!ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['urlInvalida']) return 'URL invalida (ej: https://ejemplo.com)';
    return '';
  }

   getProveedorGroupError(): string {
     const group = this.compraForm;
     if (!group.errors) return '';
     if (group.errors['proveedorIncompleto'] === 'numero') return 'Ingrese el numero de documento del proveedor';
     if (group.errors['proveedorIncompleto'] === 'tipo') return 'Seleccione el tipo de documento';
      if (group.errors['proveedorIncompleto'] === 'nombre') return 'No se pudo obtener el nombre. Verifique el documento ingresado';
     return '';
   }

   getServerError(): string {
     return this.compraServerError || '';
   }

  getItemError(index: number, field: string): string {
    const item = this.items.at(index);
    const ctrl = item.get(field);
    if (!ctrl?.errors || !ctrl.touched) return '';

    if (ctrl.errors['required']) {
      const labels: Record<string, string> = {
        producto: 'El nombre del producto es obligatorio',
        cantidad: 'La cantidad es obligatoria',
        precio_unitario: 'El precio es obligatorio'
      };
      return labels[field] || 'Campo obligatorio';
    }
    if (ctrl.errors['min']) {
      if (field === 'cantidad') return 'Minimo 1 unidad';
      if (field === 'precio_unitario') return 'Debe ser mayor a S/ 0.00';
      if (field === 'descuento') return 'No puede ser negativo';
    }
    return '';
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.f[field];
    return !!(ctrl && ctrl.invalid && (ctrl.touched || this.submitted));
  }

  isGroupFieldInvalid(field: string): boolean {
    const ctrl = this.compraForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || this.submitted));
  }

  isItemFieldInvalid(index: number, field: string): boolean {
    const ctrl = this.items.at(index).get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || this.submitted));
  }

  markAllAsTouched() {
    this.compraForm.markAllAsTouched();
    this.items.controls.forEach(item => item.markAllAsTouched());
  }

  // ==================== TOTALES ====================

  get totales() {
    let subtotalBruto = 0;
    let descuentosTotales = 0;

    this.items.controls.forEach(item => {
      const cantidad = item.get('cantidad')?.value || 0;
      const precio = item.get('precio_unitario')?.value || 0;
      const descuento = item.get('descuento')?.value || 0;
      subtotalBruto += cantidad * precio;
      descuentosTotales += descuento;
    });

    subtotalBruto = parseFloat(subtotalBruto.toFixed(2));
    descuentosTotales = parseFloat(descuentosTotales.toFixed(2));
    const gravadas = parseFloat((subtotalBruto - descuentosTotales).toFixed(2));
    const igv = parseFloat((gravadas * 0.18).toFixed(2));
    const total = parseFloat((gravadas + igv).toFixed(2));

    return {
      gravadas,
      op_exoneradas: 0,
      op_inafectas: 0,
      op_gratuitas: 0,
      dctos_totales: descuentosTotales,
      icbper: 0,
      igv,
      total,
    };
  }

  calcularTotalesDesdeItems() {
    this.cdr.detectChanges();
  }

  // ==================== ITEMS ====================

  agregarItem() {
    const item = this.fb.group({
      producto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0, [Validators.required, Validators.min(0.01)]],
      descuento: [0, [Validators.min(0)]],
    });

    item.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calcularTotalesDesdeItems();
    });

    this.items.push(item);
    this.calcularTotalesDesdeItems();
  }

  eliminarItem(index: number) {
    this.items.removeAt(index);
    this.calcularTotalesDesdeItems();
  }

  getItemSubtotal(index: number): number {
    const item = this.items.at(index);
    const cantidad = item.get('cantidad')?.value || 0;
    const precio = item.get('precio_unitario')?.value || 0;
    const descuento = item.get('descuento')?.value || 0;
    return parseFloat(((cantidad * precio) - descuento).toFixed(2));
  }

   // ==================== ARCHIVO XML ====================

   private labelTipo(tipo: string): string {
     return this.tipoComprobanteLabels[tipo] || `tipo ${tipo}`;
   }

   /**
    * El XML debe ser del mismo tipo que el seleccionado (01 factura / 03 boleta).
    * Retorna false y muestra error si no coincide.
    */
   private xmlCoincideTipo(datos: { tipo_comprobante?: string }): boolean {
     const tipoForm = this.compraForm.get('tipo_comprobante')?.value || this.tipoComprobanteSeleccionado || '01';
     const xmlTipo = (datos.tipo_comprobante || '').trim();
     if (xmlTipo !== tipoForm) {
       const detalle = xmlTipo === '01' || xmlTipo === '03'
         ? `El XML es una ${this.labelTipo(xmlTipo).toUpperCase()} pero seleccionaste ${this.labelTipo(tipoForm).toUpperCase()}`
         : `El XML es de tipo ${xmlTipo} (solo se permiten facturas 01 y boletas 03)`;
       this.alerts.open('El XML no coincide con el tipo', {
         label: `${detalle}. Sube el XML correcto.`,
         appearance: 'error'
       }).subscribe();
       return false;
     }
     return true;
   }

   /**
    * El RUC manual o buscado debe coincidir con el RUC del XML.
    * Si no se ingresó RUC, se autocompleta con el del XML. Sin XML no dice nada.
    * Retorna false y muestra error si difieren (no se debe enviar).
    */
   private xmlCoincideRuc(datos: { numero_documento_proveedor?: string; nombre_proveedor?: string; tipo_documento_proveedor?: string }): boolean {
     const xmlRuc = (datos.numero_documento_proveedor || '').trim();
     if (!xmlRuc) return true;
     const formRuc = ((this.compraForm.get('numero_documento_proveedor')?.value || '') as string).trim();
     if (formRuc && formRuc !== xmlRuc) {
       this.alerts.open('El RUC no coincide con el XML', {
         label: `Ingresaste ${formRuc} pero el XML es de ${xmlRuc}. Deben ser el mismo RUC.`,
         appearance: 'error'
       }).subscribe();
       return false;
     }
     if (!formRuc) {
       // El XML trae catálogo 06 (6=RUC, 1=DNI); el formulario usa 07=RUC, 01=DNI
       const tipoDocXml = datos.tipo_documento_proveedor === '1' ? '01' : '07';
       this.origenProveedor = 'consulta';
       this.proveedorRegistradoRuc = '';
       this.proveedorNoEncontrado = false;
       this.compraForm.patchValue({
         numero_documento_proveedor: xmlRuc,
         nombre_proveedor: datos.nombre_proveedor || '',
         tipo_documento_proveedor: tipoDocXml,
       });
     }
     return true;
   }

   private async validarXmlContraTipoSeleccionado(): Promise<boolean> {
     if (!this.archivoFile) return true;
     let datos;
     try {
       datos = await parseXmlCompra(this.archivoFile);
     } catch {
       return true; // el error de parseo se reporta en sincronizar/registrar
     }
     return this.xmlCoincideTipo(datos);
   }

   async onArchivoSelected(event: Event) {
     const input = event.target as HTMLInputElement;
     if (input.files && input.files.length > 0) {
       const file = input.files[0];
       const isXml = file.type === 'text/xml' || file.name.endsWith('.xml');

       if (!isXml) {
         this.alerts.open('Archivo invalido', {
           label: 'Solo se permiten archivos .xml',
           appearance: 'warning'
         }).subscribe();
         return;
       }

       this.archivoFile = file;
       // Validar de inmediato contra el tipo seleccionado
       const ok = await this.validarXmlContraTipoSeleccionado();
       if (!ok) {
         this.archivoFile = null;
         input.value = '';
       }
       this.cdr.detectChanges();
     }
   }

   onPdfSelected(event: Event) {
     const input = event.target as HTMLInputElement;
     if (input.files && input.files.length > 0) {
       const file = input.files[0];
       const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

       if (isPdf) {
         this.archivoPdf = file;
       } else {
         this.alerts.open('Archivo invalido', {
           label: 'Solo se permiten archivos .pdf',
           appearance: 'warning'
         }).subscribe();
       }
     }
   }

   onImagenSelected(event: Event) {
     const input = event.target as HTMLInputElement;
     if (input.files && input.files.length > 0) {
       const file = input.files[0];
       const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);

       if (isImg) {
         this.archivoImagen = file;
       } else {
         this.alerts.open('Archivo invalido', {
           label: 'Solo se permiten imágenes .jpg/.jpeg/.png/.webp',
           appearance: 'warning'
         }).subscribe();
       }
     }
   }

  async sincronizar() {
    if (!this.archivoFile) return;

    this.parseando = true;
    this.cdr.detectChanges();

    try {
      const datos = await parseXmlCompra(this.archivoFile);

      // El XML debe coincidir con el tipo seleccionado: no mezclar factura/boleta
      if (!this.xmlCoincideTipo(datos)) {
        this.archivoFile = null;
        return;
      }

      // El XML trae catálogo 06 (6=RUC, 1=DNI); el formulario usa 07=RUC, 01=DNI
      const tipoDocXml = datos.tipo_documento_proveedor === '1' ? '01' : '07';

      // Mostrar la vista "Por RUC" para que se vea el RUC autocompletado
      if ((datos.numero_documento_proveedor || '').trim()) {
        this.origenProveedor = 'consulta';
        this.proveedorRegistradoRuc = '';
        this.proveedorNoEncontrado = false;
      }

      this.compraForm.patchValue({
        tipo_comprobante: datos.tipo_comprobante,
        serie: datos.serie,
        correlativo: datos.correlativo,
        fecha_emision: datos.fecha_emision,
        moneda: datos.moneda,
        forma_pago: datos.forma_pago,
        nombre_proveedor: datos.nombre_proveedor,
        numero_documento_proveedor: datos.numero_documento_proveedor,
        tipo_documento_proveedor: tipoDocXml,
      });

      this.items.clear();
      datos.items.forEach((itemData: any) => {
        const item = this.fb.group({
          producto: [itemData.producto, Validators.required],
          cantidad: [itemData.cantidad, [Validators.required, Validators.min(1)]],
          precio_unitario: [itemData.precio_unitario, [Validators.required, Validators.min(0.01)]],
          descuento: [itemData.descuento || 0, [Validators.min(0)]],
        });

        item.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.calcularTotalesDesdeItems();
        });

        this.items.push(item);
      });

      this.calcularTotalesDesdeItems();

      this.alerts.open('Sincronizado', {
        label: `${datos.items.length} producto(s) importado(s) del XML`,
        appearance: 'success'
      }).subscribe();
    } catch (error: any) {
      this.alerts.open('Error al sincronizar', {
        label: error.message || 'No se pudo parsear el archivo',
        appearance: 'error'
      }).subscribe();
    } finally {
      this.parseando = false;
      this.cdr.detectChanges();
    }
  }

  // ==================== REGISTRO (endpoint único POST /api/compras/crear/) ====================

  /** Construye el payload nuevo: proveedor {id} o {nombre,tipo_documento,numero_documento} + items {descripcion,codigo}. */
  private buildCompraPayload(datosXml?: any): CreateCompra | null {
    const f = this.compraForm.value;
    const t = this.totales;

    const tipo = (f.tipo_comprobante || this.tipoComprobanteSeleccionado || datosXml?.tipo_comprobante || '01') as string;
    const serie = ((f.serie || datosXml?.serie || '') as string).trim().toUpperCase();
    const correlativo = ((f.correlativo || datosXml?.correlativo || '') as string).trim();
    const fecha_emision = f.fecha_emision || datosXml?.fecha_emision || '';

    // Items: formulario tiene prioridad; si no, los del XML parseado
    let rawItems: any[] = [];
    if (this.items.length > 0) rawItems = f.items;
    else if (datosXml?.items?.length) rawItems = datosXml.items;

    const items = (rawItems || []).map((it: any) => ({
      cantidad: Number(it.cantidad),
      precio_unitario: Number(it.precio_unitario),
      descuento: Number(it.descuento ?? 0),
      descripcion: it.descripcion ?? it.producto ?? '',
      ...(it.codigo ? { codigo: it.codigo } : {}),
    }));

    if (!serie || !correlativo || !fecha_emision || items.length === 0) return null;

    const compra: CreateCompra = {
      tipo_comprobante: tipo,
      serie,
      correlativo,
      fecha_emision,
      forma_pago: f.forma_pago || datosXml?.forma_pago || 'CONTADO',
      moneda: f.moneda || datosXml?.moneda || 'PEN',
      total: t.total,
      igv: t.igv,
      gravadas: t.gravadas,
      op_exoneradas: t.op_exoneradas,
      op_inafectas: t.op_inafectas,
      op_gratuitas: t.op_gratuitas,
      dctos_totales: t.dctos_totales,
      icbper: t.icbper,
      items,
    };

    // Proveedor: {id} si es de registrados, o {nombre,tipo_documento,numero_documento}
    const provSeleccionado = this.proveedorRegistradoSeleccionado;
    if (this.origenProveedor === 'registrados' && provSeleccionado) {
      compra.proveedor = { id: provSeleccionado.id };
    } else {
      const nombre = f.nombre_proveedor || datosXml?.nombre_proveedor || '';
      const tipoDoc = f.tipo_documento_proveedor || datosXml?.tipo_documento_proveedor || '';
      const nroDoc = f.numero_documento_proveedor || datosXml?.numero_documento_proveedor || '';
      if (nombre || nroDoc) {
        compra.proveedor = {
          ...(nombre ? { nombre } : {}),
          ...(tipoDoc ? { tipo_documento: tipoDoc } : {}),
          ...(nroDoc ? { numero_documento: nroDoc } : {}),
        };
      }
    }

    if (f.documento_relacionado) compra.documento_relacionado = f.documento_relacionado;
    if (f.enlace_verificacion) compra.enlace_verificacion = f.enlace_verificacion;
    if (f.observaciones) compra.observaciones = f.observaciones;

    // Archivos opcionales (multipart) — keys backend: xml / pdf / imagen.
    // Si no hay archivos se envía JSON puro al mismo endpoint único.
    if (this.archivoFile) compra.xml = this.archivoFile;
    if (this.archivoPdf) compra.pdf = this.archivoPdf;
    if (this.archivoImagen) compra.imagen = this.archivoImagen;

    return compra;
  }

  async registrarCompra() {
    this.submitted = true;
    this.markAllAsTouched();

    if (this.compraForm.invalid || this.items.length === 0) {
      const errores: string[] = [];

      if (this.f['tipo_comprobante'].invalid) errores.push('Tipo de comprobante');
      if (this.f['serie'].invalid) errores.push('Serie');
      if (this.f['correlativo'].invalid) errores.push('Correlativo');
      if (this.f['fecha_emision'].invalid) errores.push('Fecha de emision');
      if (this.f['forma_pago'].invalid) errores.push('Forma de pago');
      if (this.items.length === 0) errores.push('Al menos un producto');

      if (this.compraForm.errors?.['proveedorIncompleto']) errores.push('Datos del proveedor incompletos');

      this.alerts.open('Formulario incompleto', {
        label: `Corrige: ${errores.join(', ')}`,
        appearance: 'warning'
      }).subscribe();
      return;
    }

    // Verificación final con el XML (si se subió): debe coincidir tipo y RUC.
    // El tipo o el RUC pudieron cambiar después de subir el archivo.
    // Sin XML no se dice nada.
    if (this.archivoFile) {
      let datos;
      try {
        datos = await parseXmlCompra(this.archivoFile);
      } catch (error: any) {
        this.alerts.open('No se pudo leer el XML', {
          label: error.message || 'Sube un XML válido o quítalo para continuar',
          appearance: 'error'
        }).subscribe();
        return;
      }
      if (!this.xmlCoincideTipo(datos)) {
        this.archivoFile = null;
        return;
      }
      if (!this.xmlCoincideRuc(datos)) {
        return;
      }
    }

    // Sin archivos -> JSON; con archivos -> multipart (mismo endpoint único)
    const compra = this.buildCompraPayload();
    if (!compra) {
      this.alerts.open('Formulario incompleto', {
        label: 'Revisa serie, correlativo, fecha e items',
        appearance: 'warning'
      }).subscribe();
      return;
    }

    this.store.dispatch(crearCompra({ compra }));

    this.actions$.pipe(
      ofType(crearCompraExito),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.limpiarFormulario();
    });
  }

  limpiarFormulario() {
    this.submitted = false;
    this.items.clear();
    this.compraForm.reset({
      tipo_comprobante: '01',
      serie: '',
      correlativo: '',
      fecha_emision: '',
      forma_pago: 'CONTADO',
      moneda: 'PEN',
      tipo_documento_proveedor: '',
      numero_documento_proveedor: '',
      nombre_proveedor: '',
      documento_relacionado: '',
      enlace_verificacion: '',
      observaciones: '',
    });
    this.archivoFile = null;
    this.archivoPdf = null;
    this.archivoImagen = null;
    this.origenProveedor = 'registrados';
    this.proveedorRegistradoRuc = '';
    this.proveedorNoEncontrado = false;
    this.tipoComprobanteSeleccionado = '';
    this.pasoActual = 1;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
