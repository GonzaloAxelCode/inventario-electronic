import { Pedido, PedidoProducto } from '@/app/models/pedido.models';
import { actualizarPedido, actualizarPedidoError, actualizarPedidoExito } from '@/app/state/actions/pedido.actions';
import { loadClientes } from '@/app/state/actions/cliente.actions';
import { loadInventarios } from '@/app/state/actions/inventario.actions';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { Inventario } from '@/app/models/inventario.models';
import { AppState } from '@/app/state/app.state';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { Cliente } from '@/app/models/cliente.models';
import { ConsultaService } from '@/app/services/consultas.service';
import { DialogService } from '@/app/services/dialogs-services/dialog.service';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { VentaService } from '@/app/services/venta.service';
import { selectClienteState } from '@/app/state/selectors/cliente.selectors';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { TuiDialogContext, TuiDataList, TuiLabel, TuiSelect, TuiAlertService, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiComboBox, TuiDataListWrapper, TuiFilterByInputPipe, TuiInputNumber, TuiSegmented, TuiTextarea } from '@taiga-ui/kit';
import { TuiSelectModule, TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { catchError, finalize, of, Subject, take, takeUntil, timeout } from 'rxjs';

@Component({
  selector: 'app-dialogpedidodetail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TuiDataList, TuiLabel, TuiSelect, TuiSelectModule, TuiInputModule, TuiTextfieldControllerModule, TuiTextfield, TuiTextfieldDropdownDirective, TuiTextarea, TuiSegmented, TuiComboBox, TuiDataListWrapper, TuiFilterByInputPipe, TuiInputNumber],
  templateUrl: './dialogpedidodetail.component.html',
  styleUrl: './dialogpedidodetail.component.scss'
})
export class DialogpedidodetailComponent implements OnInit, OnDestroy {
  protected readonly context = injectContext<TuiDialogContext<boolean, Pedido>>();
  public pedido: Pedido = { ...this.context.data } as Pedido;
  private readonly store = inject(Store<AppState>);
  private readonly actions$ = inject(Actions);
  private readonly alerts = inject(TuiAlertService);
  private readonly consultaService = inject(ConsultaService);
  private readonly dialogProductos = inject(DialogService);
  private readonly dialogVentaDetail = inject(DialogVentaDetailService);
  private readonly ventaService = inject(VentaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  inventarios: Inventario[] = [];
  saving = false;
  abriendoVenta = false;

  /** Pedido completado = solo lectura, sin edición. */
  get esCompletado(): boolean {
    return this.pedido.estado === 'COMPLETADO';
  }

  URL_BASE = URL_BASE;

  readonly tiposPedido = ['MESA', 'DELIVERY', 'TAKEAWAY', 'MOSTRADOR'];
  readonly canalesVenta = ['PRESENCIAL', 'WHATSAPP', 'WEB', 'TELEFONO', 'TIKTOK'];
  readonly prioridades = ['NORMAL', 'URGENTE'];
  readonly estadosPago = ['PENDIENTE', 'PAGADO'];
  readonly estados = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'VENCIDO', 'CANCELADO'];
  readonly metodosPago = ['Efectivo', 'YAPE', 'PLIN', 'Transferencia', 'Tarjeta', 'Otros'];
  readonly cantidadesBase = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  /** FormGroup contenedor + FormArray reactivo para los productos (igual que registrarpedido). */
  productosGroup: FormGroup = this.fb.group({ productos: new FormArray<FormGroup>([]) });
  get productosFormArray(): FormArray<FormGroup> {
    return this.productosGroup.get('productos') as FormArray<FormGroup>;
  }

  /** Totales recalculados (se actualizan en cada cambio). */
  totales = { subtotal: 0, descuentos: 0, igv: 0, total: 0 };

  vistaCliente: 'sin_cliente' | 'buscar' | 'nuevo' = 'sin_cliente';
  clientes: Cliente[] = [];
  documentoBuscado = '';
  documentoNuevo = '';
  loaderCliente = false;
  errorCliente = false;

  private opcionesCache = new Map<number, number[]>();

  ngOnInit(): void {
    const fuente = this.pedido.productos_json?.length
      ? this.pedido.productos_json
      : this.pedido.productos?.length
        ? this.pedido.productos
        : [];

    for (const it of fuente) {
      this.productosFormArray.push(this.crearProductoFormGroup(it));
    }

    // Pedido completado: todo el formulario de productos en solo lectura
    if (this.esCompletado) {
      this.productosGroup.disable();
    }

    this.productosFormArray.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.recalcularTotales());
    this.recalcularTotales();

    this.store.dispatch(loadClientes());
    this.store.dispatch(loadInventarios());
    this.store.select(selectInventario)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: any) => {
        this.inventarios = state.inventarios || [];
      });
    this.store.select(selectClienteState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.clientes = state.clientes || [];
        this.initVistaCliente();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ---------- Helpers numéricos ---------- */

  aNum(v: any): number {
    if (typeof v === 'number' && !isNaN(v)) return v;
    if (v == null || v === '') return 0;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  /* ---------- Precio bruto (antes de descuento) ---------- */

  precioBruto(item: any): number {
    const co = this.aNum(item.costo_original);
    if (co > 0) return co;
    const cant = this.aNum(item.cantidad);
    const puNet = this.aNum(item.precio_unitario ?? item.valor_unitario ?? 0);
    const d = this.aNum(item.descuento);
    return puNet + (cant > 0 ? d / cant : 0);
  }

  /* ---------- FormArray helpers ---------- */

  private crearProductoFormGroup(item: any): FormGroup {
    return this.fb.group({
      inventarioId: [this.aNum(item.inventarioId ?? item.inventario)],
      producto: [item.producto ?? item.producto_id ?? null],
      producto_nombre: [item.producto_nombre ?? ''],
      producto_sku: [item.producto_sku ?? ''],
      producto_imagen: [item.producto_imagen ?? item.imagen ?? ''],
      cantidad: [this.aNum(item.cantidad)],
      valor_unitario: [this.aNum(item.valor_unitario)],
      precio_unitario: [this.aNum(item.precio_unitario)],
      costo_original: [this.aNum(item.costo_original)],
      descuento: [this.aNum(item.descuento)],
    });
  }

  opcionesCantidad(fg: FormGroup): number[] {
    const actual = Math.round(this.aNum(fg.get('cantidad')?.value));
    const key = fg.get('producto')?.value ?? actual;
    const cached = this.opcionesCache.get(key);
    if (cached && cached.includes(actual)) return cached;
    const set = new Set<number>([...this.cantidadesBase]);
    if (actual > 0) set.add(actual);
    const opts = [...set].sort((a, b) => a - b);
    this.opcionesCache.set(key, opts);
    return opts;
  }

  trackByProducto(_index: number, fg: FormGroup): any {
    return fg.get('producto')?.value ?? fg.get('producto_sku')?.value ?? _index;
  }

  trackByNumero(_index: number, n: number): number {
    return n;
  }

  /* ---------- Totales ---------- */

  recalcularTotales(): void {
    let subtotal = 0;
    let descuentos = 0;
    for (const fg of this.productosFormArray.controls) {
      const cant = this.aNum(fg.get('cantidad')?.value);
      const d = this.aNum(fg.get('descuento')?.value);
      subtotal += cant * this.precioBruto(fg.getRawValue());
      descuentos += d;
    }
    const base = subtotal - descuentos;
    const igv = base * 0.18;
    const envio = this.aNum(this.pedido.costo_envio);
    this.totales = { subtotal, descuentos, igv, total: base + envio };
    this.cdr.markForCheck();
  }

  getProductSubtotal(fg: FormGroup): number {
    const cant = this.aNum(fg.get('cantidad')?.value);
    return cant * this.precioBruto(fg.getRawValue()) - this.aNum(fg.get('descuento')?.value);
  }

  precioMostrado(fg: FormGroup): number {
    return this.precioBruto(fg.getRawValue());
  }

  /* ---------- Cliente ---------- */

  private initVistaCliente(): void {
    const doc = (this.pedido.numero_documento_cliente || '').trim();
    const nombre = (this.pedido.nombre_cliente || '').trim();
    if (!doc && (!nombre || nombre === 'Sin cliente')) {
      this.vistaCliente = 'sin_cliente';
      return;
    }
    const existente = this.clientes.find(c => c.document === doc);
    if (doc && existente) {
      this.vistaCliente = 'buscar';
      this.documentoBuscado = `${existente.document} - ${existente.fullname}`;
      this.aplicarClienteExistente(existente, false);
    } else {
      this.vistaCliente = 'nuevo';
      this.documentoNuevo = doc;
    }
  }

  get segmentoClienteIndex(): number {
    return this.vistaCliente === 'sin_cliente' ? 0 : this.vistaCliente === 'buscar' ? 1 : 2;
  }

  onSegmentoCliente(index: number): void {
    this.vistaCliente = index === 0 ? 'sin_cliente' : index === 1 ? 'buscar' : 'nuevo';
    this.errorCliente = false;
    if (this.vistaCliente === 'sin_cliente') {
      this.documentoBuscado = '';
      this.documentoNuevo = '';
    }
  }

  private aplicarClienteExistente(c: Cliente, limpiarDoc = true): void {
    this.pedido = {
      ...this.pedido,
      numero_documento_cliente: c.document,
      nombre_cliente: c.fullname || '',
      email_cliente: c.email || '',
      telefono_cliente: c.phone || '',
    };
    if (limpiarDoc) this.documentoNuevo = c.document || '';
  }

  elegirClienteExistente(valor: string): void {
    const doc = (valor || '').split('-')[0].trim();
    if (!doc) return;
    const c = this.clientes.find(x => x.document === doc);
    if (c) this.aplicarClienteExistente(c);
  }

  get opcionesClientes(): string[] {
    return (this.clientes || []).map(c => `${c.document} - ${c.fullname}`);
  }

  buscarDocumento(): void {
    this.errorCliente = false;
    const documento = (this.documentoNuevo || '').trim();
    if (!documento) return;

    const local = this.clientes.find(c => c.document === documento);
    if (local) {
      this.aplicarClienteExistente(local, false);
      return;
    }

    const obs =
      documento.length === 8 ? this.consultaService.consultarDNI(documento)
      : documento.length === 11 ? this.consultaService.consultarRUC(documento)
      : null;
    if (!obs) {
      this.errorCliente = true;
      return;
    }

    this.loaderCliente = true;
    obs.pipe(
      timeout(5000),
      catchError(() => {
        this.errorCliente = true;
        return of(null);
      }),
      finalize(() => { this.loaderCliente = false; })
    ).subscribe((data: any) => {
      if (data && (data.nombre_completo || data.nombre_o_razon_social)) {
        this.pedido = {
          ...this.pedido,
          numero_documento_cliente: data.ruc || data.numero || documento,
          nombre_cliente: data.nombre_completo || data.nombre_o_razon_social || '',
        };
        this.errorCliente = false;
      } else {
        this.errorCliente = true;
      }
    });
  }

  /* ---------- Agregar / Quitar productos ---------- */

  agregarProducto(): void {
    this.dialogProductos.open().subscribe((result: any) => {
      if (!result) return;
      const idProducto = result.producto?.id ?? result.producto;

      const existente = this.productosFormArray.controls.find((fg: FormGroup) => {
        const prod = fg.get('producto')?.value;
        return (idProducto != null && prod === idProducto) ||
          (result.producto_sku && fg.get('producto_sku')?.value === result.producto_sku);
      });

      if (existente) {
        const cant = this.aNum(existente.get('cantidad')?.value) + 1;
        existente.get('cantidad')?.setValue(cant);
        return;
      }

      if (Number(result.cantidad) <= 0 || Number(result.costo_venta) <= 0 || result.activo === false) {
        this.alerts.open('Producto no disponible', {
          label: 'Sin stock, sin precio o inactivo.',
          appearance: 'warning',
        }).subscribe();
        return;
      }

      this.productosFormArray.push(this.crearProductoFormGroup({
        producto: idProducto,
        producto_id: idProducto,
        inventarioId: result.id,
        producto_nombre: result.producto_nombre,
        producto_sku: result.producto_sku,
        producto_imagen: result.imagen_producto,
        cantidad: 1,
        valor_unitario: result.costo_venta,
        precio_unitario: result.costo_venta,
        costo_original: result.costo_venta,
        descuento: 0,
      }));
    });
  }

  quitarProducto(index: number): void {
    this.productosFormArray.removeAt(index);
  }

  /* ---------- Guardar ---------- */

  private resolverInventarioId(fg: FormGroup): number {
    const directo = this.aNum(fg.get('inventarioId')?.value);
    if (directo > 0) return directo;
    const prodId = fg.get('producto')?.value;
    if (prodId == null) return 0;
    const inv = this.inventarios.find((v: any) => v.activo !== false && Number(v.producto) === Number(prodId));
    return inv?.id ?? 0;
  }

  guardarCambios(): void {
    if (this.saving || this.esCompletado) return;
    if (!this.productosFormArray.length) {
      this.alerts.open('Sin productos', { label: 'Agrega al menos un producto.', appearance: 'warning' }).subscribe();
      return;
    }

    const productos: any[] = [];
    for (const fg of this.productosFormArray.controls) {
      const cant = this.aNum(fg.get('cantidad')?.value);
      const desc = this.aNum(fg.get('descuento')?.value);
      const bruto = cant * this.precioBruto(fg.getRawValue());
      const nombre = fg.get('producto_nombre')?.value ?? 'producto';

      if (cant <= 0) {
        this.alerts.open('Cantidad inválida', { label: `«${nombre}» debe tener cantidad mayor a 0.`, appearance: 'warning' }).subscribe();
        return;
      }
      if (desc < 0 || desc > bruto + 0.01) {
        this.alerts.open('Descuento inválido', { label: `El descuento de «${nombre}» no puede superar su total (S/ ${bruto.toFixed(2)}).`, appearance: 'warning' }).subscribe();
        return;
      }

      const inventarioId = this.resolverInventarioId(fg);
      if (!inventarioId) {
        this.alerts.open('Producto sin inventario', { label: `No se encontró el inventario de «${nombre}». Recarga la página e intenta de nuevo.`, appearance: 'error' }).subscribe();
        return;
      }
      productos.push({ inventarioId, cantidad_final: cant, descuento: desc });
    }

    const sinCliente = this.vistaCliente === 'sin_cliente';
    const numero = sinCliente
      ? ''
      : (this.vistaCliente === 'buscar'
        ? (this.documentoBuscado || '').split('-')[0].trim()
        : (this.documentoNuevo || '').trim()) || this.pedido.numero_documento_cliente || '';
    const nombre = sinCliente ? '' : (this.pedido.nombre_cliente || '');
    this.saving = true;
    this.store.dispatch(actualizarPedido({
      pedidoId: this.pedido.id,
      data: {
        tipo_pedido: this.pedido.tipo_pedido,
        canal_venta: this.pedido.canal_venta,
        prioridad: this.pedido.prioridad,
        notas_internas: this.pedido.notas_internas ?? '',
        direccion_envio: this.pedido.direccion_envio ?? '',
        referencia_ubicacion: this.pedido.referencia_ubicacion ?? '',
        cliente: {
          tipo_documento: numero.length === 11 ? '6' : '1',
          numero,
          nombre_completo: nombre,
          correo_cliente: this.pedido.email_cliente || '',
          telefono_cliente: this.pedido.telefono_cliente || '',
        },
        productos,
      }
    }));
    this.actions$.pipe(
      ofType(actualizarPedidoExito, actualizarPedidoError),
      take(1),
      finalize(() => { this.saving = false; }),
      takeUntil(this.destroy$),
    ).subscribe((a) => {
      if (a.type === actualizarPedidoExito.type) {
        this.close();
      } else {
        this.cdr.markForCheck();
      }
    });
  }

  cancelar(): void {
    if (this.saving || this.abriendoVenta) return;
    this.context.completeWith(false);
  }

  /** Abre el detalle de la venta asociada al pedido. */
  verVenta(): void {
    const ventaId = this.pedido.venta_id;
    if (!ventaId || this.abriendoVenta) return;
    this.abriendoVenta = true;
    this.ventaService.getVentaById(ventaId).pipe(
      finalize(() => {
        this.abriendoVenta = false;
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: (venta) => this.dialogVentaDetail.open(venta).subscribe(),
      error: () => this.alerts.open('No se pudo abrir la venta', {
        label: 'Intenta de nuevo.',
        appearance: 'error',
      }).subscribe(),
    });
  }

  /* ---------- Display helpers ---------- */

  getImagenProducto(fg: FormGroup): string {
    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";
    const raw = fg.get('producto_imagen')?.value;
    if (!raw) return placeholder;
    if (String(raw).startsWith('http')) return String(raw);
    return URL_BASE + String(raw);
  }

  formatDate(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatTime(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(fecha: string): string {
    if (!fecha) return '-';
    return this.formatDate(fecha) + ' ' + this.formatTime(fecha);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'COTIZADO': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'CONFIRMADO': return 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400';
      case 'EN_PREPARACION': return 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400';
      case 'LISTO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'ENTREGADO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'COMPLETADO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'VENCIDO': return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'CANCELADO': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-stone-50 text-stone-700 dark:bg-stone-900/20 dark:text-stone-400';
    }
  }

  getClienteNombre(): string {
    return this.pedido.nombre_cliente || 'Sin cliente';
  }

  getClienteDocumento(): string {
    return this.pedido.numero_documento_cliente || '-';
  }

  close(): void {
    this.context.completeWith(true);
  }
}
