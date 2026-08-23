import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiButton, TuiDataList, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, Subject, startWith } from 'rxjs';
import { crearCompra, crearCompraExito } from '@/app/state/actions/compra.actions';
import { AppState } from '@/app/state/app.state';
import { selectCompra } from '@/app/state/selectors/compra.selectors';
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

  submitted = false;

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
  tiposDocProveedor = ['01', '04', '07', '11'];
  tiposDocProveedorLabels: Record<string, string> = {
    '01': 'DNI',
    '04': 'Carnet de Extranjeria',
    '07': 'RUC',
    '11': 'Pasaporte'
  };

  tiposDocProveedorPermitidos: Record<string, string[]> = {
    '01': ['07'],
    '03': ['01', '04', '07', '11']
  };

  longitudesDocProveedor: Record<string, { min: number; max: number; label: string }> = {
    '01': { min: 8, max: 8, label: 'DNI (8 digitos)' },
    '04': { min: 9, max: 12, label: 'Carnet (9-12 caracteres)' },
    '07': { min: 11, max: 11, label: 'RUC (11 digitos)' },
    '11': { min: 8, max: 12, label: 'Pasaporte (8-12 caracteres)' }
  };

  archivoFile: File | null = null;
  parseando = false;

  compraForm: FormGroup = this.fb.group({
    tipo_comprobante: ['01', Validators.required],
    serie: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{1,10}$/)]],
    correlativo: ['', [Validators.required, Validators.pattern(/^\d{1,20}$/)]],
    fecha_emision: ['', [Validators.required, this.fechaNoFuturaValidator]],
    fecha_vencimiento: [''],
    forma_pago: ['CONTADO', Validators.required],
    moneda: ['PEN', Validators.required],
    tipo_documento_proveedor: [''],
    numero_documento_proveedor: [''],
    nombre_proveedor: [''],
    documento_relacionado: [''],
    enlace_verificacion: ['', this.urlValidator],
    observaciones: [''],
    items: this.fb.array([], [Validators.required, Validators.minLength(1)]),
  }, { validators: [this.fechaVencimientoValidator, this.proveedorValidator] });

  ngOnInit() {
    this.compraForm.get('tipo_comprobante')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onTipoComprobanteChange();
      });

    this.compraForm.get('tipo_documento_proveedor')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onTipoDocProveedorChange();
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

  fechaVencimientoValidator(group: AbstractControl): ValidationErrors | null {
    const emision = group.get('fecha_emision')?.value;
    const vencimiento = group.get('fecha_vencimiento')?.value;
    if (!emision || !vencimiento) return null;
    return new Date(vencimiento) < new Date(emision) ? { vencimientoAnterior: true } : null;
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
    const tipoDoc = tipoDocCtrl?.value;
    const permitidos = this.tiposDocProveedorPermitidos[this.compraForm.get('tipo_comprobante')?.value];

    if (tipoDoc && permitidos && !permitidos.includes(tipoDoc)) {
      tipoDocCtrl?.setValue('');
      this.compraForm.get('numero_documento_proveedor')?.setValue('');
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

  getFechaVencimientoError(): string {
    const ctrl = this.f['fecha_vencimiento'];
    if (!ctrl.errors || !ctrl.touched) return '';
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
    if (group.errors['proveedorIncompleto'] === 'nombre') return 'Ingrese el nombre del proveedor';
    return '';
  }

  getVencimientoGroupError(): string {
    const group = this.compraForm;
    if (!group.errors || !this.f['fecha_vencimiento']?.touched) return '';
    if (group.errors['vencimientoAnterior']) return 'La fecha de vencimiento debe ser posterior a la de emision';
    return '';
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

  onArchivoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const isXml = file.type === 'text/xml' || file.name.endsWith('.xml');

      if (isXml) {
        this.archivoFile = file;
      } else {
        this.alerts.open('Archivo invalido', {
          label: 'Solo se permiten archivos .xml',
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

      this.compraForm.patchValue({
        tipo_comprobante: datos.tipo_comprobante,
        serie: datos.serie,
        correlativo: datos.correlativo,
        fecha_emision: datos.fecha_emision,
        moneda: datos.moneda,
        forma_pago: datos.forma_pago,
        nombre_proveedor: datos.nombre_proveedor,
        numero_documento_proveedor: datos.numero_documento_proveedor,
        tipo_documento_proveedor: datos.tipo_documento_proveedor,
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

  // ==================== REGISTRO ====================

  registrarCompra() {
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

      if (this.compraForm.errors?.['vencimientoAnterior']) errores.push('Fecha de vencimiento invalida');
      if (this.compraForm.errors?.['proveedorIncompleto']) errores.push('Datos del proveedor incompletos');

      this.alerts.open('Formulario incompleto', {
        label: `Corrige: ${errores.join(', ')}`,
        appearance: 'warning'
      }).subscribe();
      return;
    }

    const f = this.compraForm.value;
    const t = this.totales;

    const compra: any = {
      tipo_comprobante: f.tipo_comprobante,
      serie: f.serie.trim().toUpperCase(),
      correlativo: f.correlativo.trim(),
      fecha_emision: f.fecha_emision,
      forma_pago: f.forma_pago,
      moneda: f.moneda,
      total: t.total,
      igv: t.igv,
      gravadas: t.gravadas,
      op_exoneradas: t.op_exoneradas,
      op_inafectas: t.op_inafectas,
      op_gratuitas: t.op_gratuitas,
      dctos_totales: t.dctos_totales,
      icbper: t.icbper,
      items: f.items,
    };

    if (f.fecha_vencimiento) compra.fecha_vencimiento = f.fecha_vencimiento;
    if (f.documento_relacionado) compra.documento_relacionado = f.documento_relacionado;
    if (f.enlace_verificacion) compra.enlace_verificacion = f.enlace_verificacion;
    if (f.observaciones) compra.observaciones = f.observaciones;

    if (f.tipo_documento_proveedor && f.numero_documento_proveedor && f.nombre_proveedor) {
      compra.tipo_documento_proveedor = f.tipo_documento_proveedor;
      compra.numero_documento_proveedor = f.numero_documento_proveedor;
      compra.nombre_proveedor = f.nombre_proveedor;
    }

    if (this.archivoFile) compra.archivo_xml = this.archivoFile;

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
      fecha_vencimiento: '',
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
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
