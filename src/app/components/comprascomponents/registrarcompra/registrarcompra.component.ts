import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiButton, TuiDataList, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, Subject } from 'rxjs';
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

  archivoFile: File | null = null;
  parseando = false;

  proveedores = [
    'Distribuidora Lima SAC',
    'Importaciones del Sur EIRL',
    'Comercializadora Norte SA',
    'Mayorista Central SAC',
    'Proveedor Express EIRL',
    'Soluciones Logisticas SA',
    'Grupo Empresarial Peru SAC',
    'Trading International EIRL',
    'Alimentos Premium SAC',
    'Distribuciones Rapidas SA',
  ];

  compraForm: FormGroup = this.fb.group({
    tipo_comprobante: ['01', Validators.required],
    serie: ['', Validators.required],
    correlativo: ['', Validators.required],
    fecha_emision: ['', Validators.required],
    fecha_vencimiento: [''],
    forma_pago: [''],
    total: [0, [Validators.required, Validators.min(0.01)]],
    igv: [0, [Validators.required, Validators.min(0)]],
    gravadas: [0],
    op_exoneradas: [0],
    op_inafectas: [0],
    op_gratuitas: [0],
    dctos_totales: [0],
    icbper: [0],
    moneda: ['PEN'],
    nombre_proveedor: [''],
    tipo_documento_proveedor: [''],
    numero_documento_proveedor: [''],
    documento_relacionado: [''],
    enlace_verificacion: [''],
    observaciones: [''],
    items: this.fb.array([], Validators.minLength(1)),
  });

  ngOnInit() {}

  get items(): FormArray {
    return this.compraForm.get('items') as FormArray;
  }

  get itemsControls(): FormGroup[] {
    return this.items.controls as FormGroup[];
  }

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
    const t = this.totales;

    this.compraForm.patchValue({
      gravadas: t.gravadas,
      op_exoneradas: t.op_exoneradas,
      op_inafectas: t.op_inafectas,
      op_gratuitas: t.op_gratuitas,
      dctos_totales: t.dctos_totales,
      icbper: t.icbper,
      igv: t.igv,
      total: t.total,
    }, { emitEvent: false });

    this.cdr.detectChanges();
  }

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

  registrarCompra() {
    if (this.compraForm.invalid) {
      this.alerts.open('Formulario incompleto', {
        label: 'Completa todos los campos obligatorios',
        appearance: 'warning'
      }).subscribe();
      return;
    }

    const f = this.compraForm.value;
    const t = this.totales;

    const compra = {
      tipo_comprobante: f.tipo_comprobante,
      serie: f.serie,
      correlativo: f.correlativo,
      fecha_emision: f.fecha_emision,
      fecha_vencimiento: f.fecha_vencimiento || undefined,
      forma_pago: f.forma_pago || undefined,
      total: t.total,
      igv: t.igv,
      gravadas: t.gravadas,
      op_exoneradas: t.op_exoneradas,
      op_inafectas: t.op_inafectas,
      op_gratuitas: t.op_gratuitas,
      dctos_totales: t.dctos_totales,
      icbper: t.icbper,
      moneda: f.moneda,
      nombre_proveedor: f.nombre_proveedor || undefined,
      tipo_documento_proveedor: f.tipo_documento_proveedor || undefined,
      numero_documento_proveedor: f.numero_documento_proveedor || undefined,
      documento_relacionado: f.documento_relacionado || undefined,
      enlace_verificacion: f.enlace_verificacion || undefined,
      observaciones: f.observaciones,
      items: f.items,
      archivo_xml: this.archivoFile || undefined,
    };

    console.log('Registrando compra:', compra);
    this.store.dispatch(crearCompra({ compra }));

    this.actions$.pipe(
      ofType(crearCompraExito),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.limpiarFormulario();
    });
  }

  limpiarFormulario() {
    this.items.clear();
    this.compraForm.reset({
      tipo_comprobante: '01',
      serie: '',
      correlativo: '',
      fecha_emision: '',
      fecha_vencimiento: '',
      forma_pago: '',
      total: 0,
      igv: 0,
      gravadas: 0,
      op_exoneradas: 0,
      op_inafectas: 0,
      op_gratuitas: 0,
      dctos_totales: 0,
      icbper: 0,
      moneda: 'PEN',
      nombre_proveedor: '',
      tipo_documento_proveedor: '',
      numero_documento_proveedor: '',
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
