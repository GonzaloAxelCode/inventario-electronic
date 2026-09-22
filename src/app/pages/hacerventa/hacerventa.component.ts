


import { BarcodeScannerComponent } from "@/app/components/bardcode-scanner/bardcode-scanner.component";
import { SelectclienteforsaleComponent } from "@/app/components/selectclienteforsale/selectclienteforsale.component";
import { Cliente } from "@/app/models/cliente.models";
import { Inventario } from '@/app/models/inventario.models';
import { ConsultaService } from '@/app/services/consultas.service';
import { DialogService } from '@/app/services/dialogs-services/dialog.service';
import { DialogLimiteAlcanzadoService } from '@/app/services/dialogs-services/dialog-limite-alcanzado.service';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { TiendaService } from '@/app/services/tienda.service';
import { normalizeSku } from "@/app/services/search-services/producto-search.service";
import { URL_BASE } from "@/app/services/utils/endpoints";
import { PAGE_SIZE_PEDIDOS } from '@/app/services/utils/pages-sizes';
import { loadClientes } from "@/app/state/actions/cliente.actions";
import { crearVenta, crearVentaExito, crearVentaError } from "@/app/state/actions/venta.actions";
import { cargarPedidos, eliminarPedido } from "@/app/state/actions/pedido.actions";
import { actualizarPedido, pagarPedido } from "@/app/state/actions/pedido.actions";
import { AppState } from '@/app/state/app.state';
import { selectClienteState } from "@/app/state/selectors/cliente.selectors";
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { selectPedido } from '@/app/state/selectors/pedido.selectors';
import { selectCurrenttUser, selectPermissions, selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule, Location, NgForOf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Actions, ofType } from "@ngrx/effects";
import { Store } from '@ngrx/store';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiPlatform } from "@taiga-ui/cdk";
import { TuiAlertService, TuiAppearance, TuiButton, TuiDropdown, TuiExpand, TuiIcon, TuiLabel, TuiLoader, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiBadge, TuiCheckbox, TuiChip, TuiComboBox, TuiDataListWrapper, TuiFade, TuiFilter, TuiFilterByInputPipe, TuiInputNumber, TuiItemsWithMore, TuiRadio, TuiSegmented, TuiStepper, TuiSwitch, TuiTab, TuiTabs, TuiTooltip } from '@taiga-ui/kit';
import { TuiAppBar, TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { TuiComboBoxModule, TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil, timeout } from 'rxjs';

@Component({
  selector: 'app-hacerventa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AsyncPipe,
    NgForOf,
    TuiSwitch,
    TuiPlatform,
    TuiButton,
    TuiBadge,
    TuiCheckbox,
    TuiDropdown,
    TuiIcon,
    TuiLabel,
    TuiLoader,
    TuiTextfield,
    TuiTextfieldDropdownDirective,
    TuiAppearance,
    TuiTooltip,
    TuiChip,
    TuiComboBox,
    TuiDataListWrapper,
    TuiFilter,
    TuiFilterByInputPipe,
    TuiInputNumber,
    TuiItemsWithMore,
    TuiRadio,
    TuiStepper,
    TuiExpand,
    TuiAmountPipe,
    TuiTable,
    TuiComboBoxModule,
    TuiInputModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiAppBar,
    TuiHeader,
    TuiNavigation,
    BarcodeScannerComponent,
    SelectclienteforsaleComponent,
    TuiSegmented,
    TuiTabs,
    TuiTab,
    TuiFade,
  ],
  providers: [
    { provide: 'Pythons', useValue: ['Python One', 'Python Two', 'Python Three'] },
  ],
  animations: [
    trigger('expandCollapse', [
      state('open', style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '0px', opacity: 0 })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ])
  ],
  templateUrl: './hacerventa.component.html',
  styleUrl: './hacerventa.component.scss',


})
export class HacerventaComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tiendaService = inject(TiendaService);
  private readonly dialogLimiteAlcanzado = inject(DialogLimiteAlcanzadoService);
  private readonly location = inject(Location);
  vistaActiva: 'buscar' | 'nuevo' | 'nuevo_dni_fisico' = 'buscar';
  activeTab: 'normal' | 'pedido' = 'normal';
  activeTabIndex = 0;
  validTabs = ['normal', 'pedido'] as const;

  pedidoSeleccionado: any = null;
  pedidoFlowStep = 0;
  pedidosSala: any[] = [];
  private readonly placeholderImg = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";

  cargarPedidosPendientes() {
    this.store.dispatch(cargarPedidos({ page: 1, page_size: PAGE_SIZE_PEDIDOS, filters: { estado: 'PENDIENTE' } }));
  }

  private mapearPedidosPendientes(pedidos: any[]) {
    this.pedidosSala = (pedidos || [])
      .filter(p => p.estado === 'PENDIENTE')
      .map(p => ({
        id: p.id,
        numero_pedido: p.numero_pedido,
        cliente: p.nombre_cliente || 'Sin cliente',
        nombre_cliente: p.nombre_cliente || '',
        documento: p.numero_documento_cliente || '-',
        numero_documento_cliente: p.numero_documento_cliente || '',
        telefono: p.telefono_cliente || '',
        email: p.email_cliente || '',
        direccion_cliente: p.direccion_cliente || '',
        fecha: this.formatDatePedido(p.fecha_hora),
        hora: this.formatTimePedido(p.fecha_hora),
        total: p.total,
        subtotal: p.subtotal,
        costo_envio: p.costo_envio || 0,
        descuento_total: p.descuento_total || 0,
        cantidadItems: (p.productos?.length || p.productos_json?.length || 0),
        estado: p.estado,
        metodoPago: p.metodo_pago,
        tipo_pedido: p.tipo_pedido,
        canal_venta: p.canal_venta,
        prioridad: p.prioridad,
        estado_pago: p.estado_pago,
        observaciones: p.observaciones,
        direccion_envio: p.direccion_envio,
        tipoComprobante: 'Boleta',
        productos: (p.productos || p.productos_json || []).map((prod: any) => {
          const cantP = Number(prod.cantidad) || 0;
          const puNetP = Number(prod.precio_unitario ?? prod.valor_unitario ?? 0) || 0;
          const descP = Number(prod.descuento) || 0;
          return {
          inventarioId: prod.producto || prod.inventarioId,
          productoId: prod.producto || prod.inventarioId,
          producto_nombre: prod.producto_nombre || 'Producto',
          producto_sku: prod.producto_sku || '',
          imagen_producto: this.onSetImageProduct(prod.imagen || prod.imagen_producto),
          nombre_categoria: prod.nombre_categoria || '',
          cantidad: prod.cantidad,
          costo_original: prod.costo_original || (puNetP + (cantP > 0 ? descP / cantP : 0)) || 0,
          descuento: descP,
          stock_actual: prod.stock_actual || 0
          };
        })
      }));
  }

  private formatDatePedido(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private formatTimePedido(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
  protected expanded = false;
  private destroy$ = new Subject<void>();
  errorClientNotFound = false;
  rucRequiredError = signal(false);
  selectCurrentStep = signal("Start Up");
  protected readonly units = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  protected value = this.units[0]!;
  salesTotals = {
    subtotal: 0,
    igv: 0,
    total: 0,
    descuentoTotales: 0
  };
  ventaForm: FormGroup;
  listMetodosPago = [" YAPE", "PLIN", "Transferencia(No disponible)", "Efectivo"]
  tipoComprobantes = ["Boleta", "Factura", "Anonima"]
  tipoComprobantesPedido = ["Boleta", "Factura"]
  formasPago = ["Contado"]
  monedas = ["PEN - Sol Peruano", "USD - Dolar Americano"]
  monedaControl = this.fb.control(this.monedas[0]);
  protected readonly options = { updateOn: 'blur' } as const;
  loaderSearchCliente = false;
  processingVenta = false;
  today: string;
  currentTime: string;

  mostrarCaja = true;

  protected allProductsForSale: any[] = [];
  arrayCantidades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  selectedItem: string = '1';
  protected sum(operations: readonly any[]): number {
    return operations.reduce((acc, { sum }) => acc + (sum || 0), 0);
  }

  protected orderBy(): number {
    return 0;
  }
  protected loadingCreateVenta$: Observable<any>
  protected showVentaDetailTemporary$: Observable<any>
  private readonly store = inject(Store<AppState>);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogService = inject(DialogService);
  private readonly dialogServiceVentaDetail = inject(DialogVentaDetailService);
  userPermissions$ = this.store.select(selectPermissions);
  tiendaUser!: number
  tieneSol = false;
  tieneCertificado = false;
  // Límites del plan y uso del mes (para bloquear venta al llegar al límite)
  planLimiteBoletas: number | null = null;
  planLimiteFacturas: number | null = null;
  usoBoletas = 0;
  usoFacturas = 0;
  planDiasRestantes: number | null = null;
  planHasta: string | null = null;
  private planLimitsLoadedForTienda: number | null = null;
  tiendaNombre = 'Mi Negocio';
  tiendaRuc = '';
  tiendaDireccion = '';
  tiendaTelefono = '';
  userId!: number;
  inventarios!: Inventario[]
  clientes: Cliente[] = []
  URL_BASE = URL_BASE
  is_client_exists: boolean = false
  clienteSelected!: Cliente
  @ViewChild('containerAreaProducts') container!: ElementRef<HTMLDivElement>;

  changeModeClient(valor: any) {
    this.vistaActiva = valor;

    // Limpiar campos del cliente
    this.ventaForm.patchValue({
      cliente: null,
      documento_cliente: '',
      nombre_cliente: '',
      correo_cliente: '',
      direccion_cliente: '',
      telefono_cliente: '',
      documento_cliente_existente: ''
    });

    // Actualizar validadores
    const docExistenteControl = this.ventaForm.get('documento_cliente_existente');
    const docNuevoControl = this.ventaForm.get('documento_cliente');

    if (this.vistaActiva === 'buscar') {
      docExistenteControl?.setValidators([Validators.required]);
      docNuevoControl?.clearValidators();
    } else {
      docExistenteControl?.clearValidators();
      docNuevoControl?.setValidators([
        (control: any) => this.documentoValidator(this.ventaForm?.get('tipoComprobante')?.value)(control)
      ]);
    }

    docExistenteControl?.updateValueAndValidity();
    docNuevoControl?.updateValueAndValidity();
  }

  onTabChange(index: number) {
    const tab = this.validTabs[index];
    this.activeTab = tab;
    this.activeTabIndex = index;
    this.location.replaceState(`/app/ventas/crear#${tab}`);
    if (tab === 'pedido') {
      this.cargarPedidosPendientes();
    }
  }

  private isValidTab(tab: string): boolean {
    return (this.validTabs as readonly string[]).includes(tab);
  }
  // Detectar click dentro del div
  clickedInside() {
    this.container.nativeElement.classList.add('is-focused');
  }

  // Detectar click fuera del div
  @HostListener('document:click', ['$event'])
  clickedOutside(event: MouseEvent) {
    const clickedInside = this.container.nativeElement.contains(event.target as Node);

    if (!clickedInside) {
      this.container.nativeElement.classList.remove('is-focused');
    }
  }
  // Esta función se ejecuta cuando el escáner detecta un código
  onBarcodeScanned(barcode_raw: string) {
    const barcode = normalizeSku(barcode_raw)


    // Buscar el producto en inventarios activos por SKU
    const productoEncontrado = this.inventarios
      .filter(inv => inv.activo === true)          // <-- solo activos
      .find(inv => inv.producto_sku === barcode);  // <-- buscar por SKU


    if (!productoEncontrado) {
      // Producto no encontrado
      this.alerts.open('Producto no encontrado', {
        label: `No se encontró un producto con el código: ${barcode} o esta desactivado.`,
        appearance: "warning"
      }).subscribe();
      return;
    }

    // Verificar si el producto ya está en el formulario
    const productosArray = this.ventaForm.get('productos') as FormArray;
    const productoExiste = productosArray.controls.some(
      control => control.get('inventarioId')?.value === productoEncontrado.id
    );

    if (productoExiste) {
      // Producto ya agregado, aumentar cantidad
      const productoControl = productosArray.controls.find(
        control => control.get('inventarioId')?.value === productoEncontrado.id
      );

      if (productoControl) {
        const cantidadActual = parseInt(productoControl.get('cantidad_final')?.value || '0');
        const costo_venta = parseInt(productoControl.get('costo_venta')?.value || '0');
        const stockDisponible = productoEncontrado.cantidad;

        if (cantidadActual + 1 > stockDisponible) {
          this.alerts.open('Stock insuficiente', {
            label: `No hay suficiente stock disponible. Stock actual: ${stockDisponible}`,
            appearance: "error"
          }).subscribe();
          return;
        }

        productoControl.get('cantidad_final')?.setValue((cantidadActual + 1).toString());
        this.alerts.open('Cantidad actualizada', {
          label: `Se aumentó la cantidad del producto`,
          appearance: "success"
        }).subscribe();
      }
    } else {
      // Agregar nuevo producto
      const nuevoProducto = this.fb.group({
        inventarioId: [productoEncontrado.id],
        cantidad_final: ["1", [Validators.required]],
        producto_nombre: [productoEncontrado.producto_nombre],
        producto_sku: [productoEncontrado.producto_sku],
        imagen_producto: [productoEncontrado.imagen_producto],
        nombre_categoria: [productoEncontrado.categoria_nombre],
        costo_venta: [productoEncontrado.costo_venta],

        productoId: [productoEncontrado.producto],
        stock_actual: [productoEncontrado.cantidad],
        descuento: [0],
        costo_original: [productoEncontrado.costo_venta],
      });


      const costo_venta = productoEncontrado.costo_venta || 0
      if (costo_venta <= 0) {
        this.alerts.open('Producto no tiene costo', {
          label: `El producto no tiene costo.Actualiza el costo del producto.`,
          appearance: "error"
        }).subscribe();
        return;
      }
      const stockDisponible = productoEncontrado.cantidad;

      if (stockDisponible <= 0) {
        this.alerts.open('Stock insuficiente', {
          label: `No hay suficiente stock disponible. Stock actual: ${stockDisponible}`,
          appearance: "error"
        }).subscribe();
        return;
      }
      productosArray.push(nuevoProducto);
      nuevoProducto.get('descuento')!.valueChanges.subscribe((desc: any) => {
        this.actualizarCostoTotal(nuevoProducto, desc);
      });

      this.alerts.open('Producto agregado', {
        label: `${productoEncontrado.producto_nombre} agregado correctamente`,
        appearance: "success"
      }).subscribe();
    }

    // Recalcular totales y actualizar vista
    this.calcularTotales();
    this.cdr.markForCheck();
  }
  constructor(private fb: FormBuilder, private consultaService: ConsultaService, private cdr: ChangeDetectorRef, private actions$: Actions) {
    const now = new Date();
    this.today = now.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    this.currentTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.loadingCreateVenta$ = this.store.select(selectVenta);
    this.showVentaDetailTemporary$ = this.store.select(selectVenta)
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user)
    ).subscribe(user => {
      this.tiendaUser = (user as any)?.tienda || 0;
      const td: any = (user as any)?.tienda_data;
      this.tieneSol = !!td?.tiene_sol;
      this.tieneCertificado = !!td?.tiene_certificado;
      this.loadPlanLimits();
    });
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })

    this.ventaForm = this.fb.group({
      usuarioId: [this.userId],
      metodoPago: [this.listMetodosPago[3], Validators.required],
      formaPago: [this.formasPago[0], Validators.required],
      tipoComprobante: [this.tipoComprobantes[0], Validators.required],
      cliente: [null],
      documento_cliente: [
        "",
        [
          (control: any) => this.documentoValidator(this.ventaForm?.get('tipoComprobante')?.value)(control)
        ]
      ],

      nombre_cliente: ["", ],
      correo_cliente: [""],
      direccion_cliente: [""],
      telefono_cliente: [""],
      documento_cliente_existente: ["", this.vistaActiva === "buscar" && Validators.required],
      productos: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      is_send_sunat: [true],
      is_save_user: [true],


    });

    this.productosFormArray.valueChanges.subscribe((tipo: any) => {
      const documentoCtrl = this.ventaForm.get('documento_cliente');
      documentoCtrl?.setValidators([this.documentoValidator(tipo)]);
      documentoCtrl?.updateValueAndValidity({ emitEvent: false });
      this.validarStock();
      this.calcularTotales();
    });



  }
  documents: string[] = []
  ngOnInit() {
    this.store.dispatch(loadClientes());

    this.route.fragment.subscribe((fragment) => {
      if (fragment && this.isValidTab(fragment)) {
        this.activeTab = fragment as typeof this.activeTab;
        this.activeTabIndex = this.validTabs.indexOf(fragment as any);
        if (fragment === 'pedido') {
          this.cargarPedidosPendientes();
        }
        this.cdr.markForCheck();
      }
    });

    this.ventaForm.get('is_send_sunat')?.valueChanges
      .subscribe(value => {
        this.onChangeEnviarSunat(value);
      });

    this.store.select(selectInventario).subscribe((state) => {

      this.inventarios = state.inventarios
    })

    this.store.select(selectClienteState).subscribe((state) => {

      this.clientes = state.clientes

      this.documents = state.clientes
        .filter((cliente: Cliente) => cliente.document !== '00000000')
        .map((cliente: Cliente) => cliente.document + "-" + cliente.fullname);
    })

    this.store.select(selectPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        if (this.activeTab !== 'pedido') return;
        this.mapearPedidosPendientes(state.pedidos || []);
      });
    this.ventaForm.get('tipoComprobante')?.valueChanges.subscribe((nuevoValor) => {


      // Resetea el documento del cliente
      this.borrarCliente()
      this.ventaForm.get('documento_cliente')?.reset('');
      this.ventaForm.get('cliente')?.reset(null);

    });

    this.ventaForm.get('documento_cliente_existente')?.valueChanges.subscribe((docraw) => {
      if (!docraw) return;

      const doc = docraw.split('-')[0].trim();
      const clienteEncontrado = this.clientes.find((cliente: Cliente) => cliente.document === doc);



      if (clienteEncontrado) {
        this.ventaForm.patchValue({

          documento_cliente: clienteEncontrado.document,
          nombre_cliente: clienteEncontrado.fullname || '',
          correo_cliente: clienteEncontrado.email || '',
          direccion_cliente: clienteEncontrado.address || '',
          telefono_cliente: clienteEncontrado.phone || '',
          cliente: {
            nombre_o_razon_social: clienteEncontrado.fullname,
            nombre_completo: clienteEncontrado.fullname,
            ruc: clienteEncontrado.document,
            numero: clienteEncontrado.document,
          }
        });
      }
    });


  }


  onChangeEnviarSunat(value: boolean) {
    this.ventaForm.get('is_send_sunat')?.setValue(value, { emitEvent: false });
  }

  validarStock(): void {
    if (this.pedidoFlowStep > 0) return;

    this.productosFormArray.controls.forEach((control, index) => {
      if (control.get('es_servicio')?.value) return;
      const cantidad = parseInt(control.get('cantidad_final')?.value || '0');
      const stock = parseInt(control.get('stock_actual')?.value || '0');

      if (stock - cantidad < 0) {
        control.get('cantidad_final')?.setValue(1, { emitEvent: false });
        this.alerts.open('No hay stock suficiente para agregar mas para este producto.', { label: 'Mensaje informacion', appearance: "warning" }).subscribe();
      }
    });
  }

  calcularTotales(): void {
    let subtotal = 0;
    let igv = 0;
    let total = 0;
    let descuentosTotales = 0;
    const IGV_RATE = 0.18;

    this.productosFormArray.controls.forEach(control => {
      const cantidad = parseInt(control.get('cantidad_final')?.value || '0');
      const costoVenta = parseFloat(control.get('costo_original')?.value || '0');
      const descuentoTotal = parseFloat(control.get("descuento")?.value || "0")

      const valorVenta = cantidad * costoVenta;
      subtotal += valorVenta;
      descuentosTotales += descuentoTotal
    });

    igv = (subtotal - descuentosTotales) * IGV_RATE;
    total = subtotal;

    this.salesTotals = { subtotal: total, igv, total: total - descuentosTotales, descuentoTotales: descuentosTotales };
  }


  protected showDialog(): void {    this.dialogService.open().subscribe((result: any) => {

      if (result) {

        const productosArray = this.ventaForm.get('productos') as FormArray;
        const productoExiste = productosArray.controls.some(control => control.get('inventarioId')?.value === result.id);
        if (productoExiste) {
          this.alerts.open('Mensaje informacion', { label: 'Producto ya esta agregado', appearance: "warning" }).subscribe();
          return;
        }
        const nuevoProducto = this.fb.group({
          inventarioId: [result.id],
          cantidad_final: ["1", [Validators.required]],
          producto_nombre: [result.producto_nombre,],
          nombre_categoria: [result.categoria_nombre],
          costo_venta: [result.costo_venta,],

          productoId: [result.producto.id,],
          stock_actual: [result.cantidad],
          producto_sku: [result.producto_sku],
          imagen_producto: [result.imagen_producto ? URL_BASE + result.imagen_producto : "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png"],
          descuento: [0],
          costo_original: [result.costo_venta],
        });


        productosArray.push(nuevoProducto);
        nuevoProducto.get('descuento')!.valueChanges.subscribe((desc: any) => {
          this.actualizarCostoTotal(nuevoProducto, desc);
        });
        this.calcularTotales();
        this.cdr.markForCheck();
      }
    });
  }



  // ==================== VENTA POR SERVICIO ====================
  servicioDescripcion = '';
  servicioPrecio: number | null = null;
  servicioCantidad: number | null = 1;

  /** Líneas de productos (sin servicios) con su índice real para eliminar. */
  lineasProductos(): Array<{ control: FormGroup; index: number }> {
    if (!this.productosFormArray) return [];
    return this.productosFormArray.controls
      .map((control, index) => ({ control: control as FormGroup, index }))
      .filter(e => !e.control.get('es_servicio')?.value);
  }

  /** Líneas de servicios con su índice real para eliminar. */
  lineasServicio(): Array<{ control: FormGroup; index: number }> {
    if (!this.productosFormArray) return [];
    return this.productosFormArray.controls
      .map((control, index) => ({ control: control as FormGroup, index }))
      .filter(e => !!e.control.get('es_servicio')?.value);
  }

  agregarServicio(): void {
    const descripcion = (this.servicioDescripcion || '').trim();
    const precio = Number(this.servicioPrecio);
    const cantidad = Math.max(1, parseInt(String(this.servicioCantidad ?? '1'), 10) || 1);
    if (!descripcion || !(precio > 0)) {
      this.alerts.open('Ingresa la descripción y un precio válido para el servicio.', { label: 'Mensaje informacion', appearance: 'warning' }).subscribe();
      return;
    }
    const nuevoServicio = this.fb.group({
      inventarioId: [null],
      productoId: [null],
      es_servicio: [true],
      cantidad_final: [String(cantidad), [Validators.required]],
      producto_nombre: [descripcion],
      nombre_categoria: ['Servicio'],
      costo_venta: [precio],
      costo_original: [precio],
      stock_actual: [null],
      producto_sku: ['SERVICIO'],
      imagen_producto: [this.placeholderImg],
      descuento: [0],
    });
    this.productosFormArray.push(nuevoServicio);
    nuevoServicio.get('descuento')!.valueChanges.subscribe((desc: any) => {
      this.actualizarCostoTotal(nuevoServicio, desc);
    });
    this.servicioDescripcion = '';
    this.servicioPrecio = null;
    this.servicioCantidad = 1;
    this.calcularTotales();
    this.cdr.markForCheck();
  }


  buscarCliente() {
    this.errorClientNotFound = false
    this.rucRequiredError.set(false)
    const documento = this.ventaForm.get('documento_cliente')!.value;
    const tipoComprobante = this.ventaForm.get('tipoComprobante')?.value;

    if (!documento) {
      return;
    }

    const clienteSearh = this.clientes.find((el: Cliente) => {
      return el.document === documento;
    })
    if (clienteSearh) {
      const clienteForm = {
        nombre_o_razon_social: clienteSearh.fullname,
        nombre_completo: clienteSearh.fullname,
        ruc: clienteSearh.document,
        numero: clienteSearh.document,
      };


      this.ventaForm.patchValue({
        nombre_cliente: clienteForm.nombre_completo,
        cliente: clienteForm
      });
      this.is_client_exists = true
      this.clienteSelected = clienteSearh
      return;
    }

    const consultaObservable =
      documento.length === 8
        ? this.consultaService.consultarDNI(documento)
        : documento.length === 11
          ? this.consultaService.consultarRUC(documento)
          : null;

    if (!consultaObservable) {
      return;
    }

    this.loaderSearchCliente = true;

    consultaObservable.pipe(
      timeout(5000), // 5 segundos
      catchError(error => {
        console.error('Error al consultar documento:', error);
        this.errorClientNotFound = true;
        return of(null); // Devuelve null para seguir la cadena
      }),
      finalize(() => {
        // Se ejecuta siempre, éxito o error
        this.loaderSearchCliente = false;
        this.cdr.detectChanges();
      })
    ).subscribe(response => {

      if (response.nombre_completo || response.nombre_o_razon_social) {
        const data = response;

        // Mapear un objeto unificado para el formulario
        const clienteForm = {
          nombre_o_razon_social: data.nombre_o_razon_social || data.nombre_completo || '',
          nombre_completo: data.nombre_completo || data.nombre_o_razon_social || '',
          ruc: data.ruc || '',
          numero: data.numero || '',
        };


        this.ventaForm.patchValue({
          nombre_cliente: clienteForm.nombre_completo || clienteForm.nombre_o_razon_social,
          cliente: clienteForm,
          // Siempre mantener correo/direccion/telefono en el payload (aunque se editen manualmente)
          direccion_cliente: data.direccion || data.address || (data as any).domicilio || this.ventaForm.get('direccion_cliente')?.value || '',
          correo_cliente: (data as any).email || (data as any).correo || this.ventaForm.get('correo_cliente')?.value || '',
          telefono_cliente: (data as any).telefono || (data as any).phone || this.ventaForm.get('telefono_cliente')?.value || ''
        });

        this.errorClientNotFound = false; // Resetea el error si hay datos
      } else {
        // No se encontró el documento

        this.errorClientNotFound = true;
        this.ventaForm.patchValue({
          nombre_cliente: '',
          cliente: null, documento_cliente_existente: ""

        });
      }
    });

  }

  borrarCliente() {
    this.expanded = false
    this.rucRequiredError.set(false);
    this.ventaForm.patchValue({
      documento_cliente: '',
      nombre_cliente: '',
      cliente: null,
      documento_cliente_existente: "",
      correo_cliente: '',
      direccion_cliente: '',
      telefono_cliente: ''

    });
  }

  continuarConPedido() {
    if (!this.pedidoSeleccionado) return;

    this.pedidoFlowStep = 1;

    // Forzar tipo de comprobante a Boleta (no se permite Anonima en pedidos)
    const tipoActual = this.ventaForm.get('tipoComprobante')?.value;
    if (tipoActual === 'Anonima') {
      this.ventaForm.get('tipoComprobante')?.setValue('Boleta');
    }

    while (this.productosFormArray.length) {
      this.productosFormArray.removeAt(0);
    }

    (this.pedidoSeleccionado.productos || []).forEach((prod: any) => {
      const nuevoProducto = this.fb.group({
        inventarioId: [prod.inventarioId],
        cantidad_final: [String(prod.cantidad), [Validators.required]],
        producto_nombre: [prod.producto_nombre],
        producto_sku: [prod.producto_sku],
        imagen_producto: [this.onSetImageProduct(prod.imagen || prod.imagen_producto)],
        nombre_categoria: [prod.nombre_categoria],
        costo_venta: [prod.costo_original],
        productoId: [prod.productoId],
        stock_actual: [prod.stock_actual],
        descuento: [prod.descuento || 0],
        costo_original: [prod.costo_original],
      });

      this.productosFormArray.push(nuevoProducto);
      nuevoProducto.get('descuento')!.valueChanges.subscribe((desc: any) => {
        this.actualizarCostoTotal(nuevoProducto, desc);
      });
    });

    this.ventaForm.get('tipoComprobante')?.setValue(this.pedidoSeleccionado.tipoComprobante || 'Boleta');
    this.ventaForm.get('metodoPago')?.setValue(this.pedidoSeleccionado.metodoPago || this.listMetodosPago[3]);

    // Copiar cliente del pedido al formulario de venta para que se envie en confirmarVentaPedido
    const docPedido: string = (this.pedidoSeleccionado.numero_documento_cliente || this.pedidoSeleccionado.documento || '').toString().trim();
    const nombrePedido: string = (this.pedidoSeleccionado.nombre_cliente || this.pedidoSeleccionado.cliente || '').toString().trim();
    const tieneCliente = !!nombrePedido && nombrePedido !== 'Sin cliente' && nombrePedido !== 'Cliente Varios' || (!!docPedido && docPedido !== '-' && docPedido !== '00000000');
    if (tieneCliente) {
      const docLimpio = (docPedido === '-' || docPedido === '00000000') ? '' : docPedido;
      this.ventaForm.patchValue({
        documento_cliente: docLimpio,
        nombre_cliente: (nombrePedido === 'Sin cliente' || nombrePedido === 'Cliente Varios') ? '' : nombrePedido,
        correo_cliente: this.pedidoSeleccionado.email || '',
        direccion_cliente: this.pedidoSeleccionado.direccion_cliente || '',
        telefono_cliente: this.pedidoSeleccionado.telefono || '',
        documento_cliente_existente: docLimpio ? `${docLimpio}-${nombrePedido}` : '',
        cliente: {
          nombre_o_razon_social: nombrePedido,
          nombre_completo: nombrePedido,
          ruc: docLimpio,
          numero: docLimpio,
        }
      });
    } else {
      this.borrarCliente();
    }
    this.calcularTotales();
  }

  nextPedidoStep() {
    if (this.pedidoFlowStep < 3) this.pedidoFlowStep++;
  }

  prevPedidoStep() {
    if (this.pedidoFlowStep > 0) this.pedidoFlowStep--;
  }

  volverSeleccionPedido() {
    this.pedidoFlowStep = 0;
    this.pedidoSeleccionado = null;
    while (this.productosFormArray.length) {
      this.productosFormArray.removeAt(0);
    }
    this.calcularTotales();
  }

  confirmarVentaPedido() {
    if (!this.pedidoSeleccionado) return;

    this.processingVenta = true;

    // Forzar tipo de comprobante a Boleta si es Anonima (no permitido en pedidos)
    const tipoComprobante = this.ventaForm.get('tipoComprobante')?.value;
    if (tipoComprobante === 'Anonima') {
      this.ventaForm.get('tipoComprobante')?.setValue('Boleta');
    }

    const pedidoDoc: string = (this.pedidoSeleccionado.numero_documento_cliente || this.pedidoSeleccionado.documento || '').toString().trim();
    const pedidoNombre: string = (this.pedidoSeleccionado.nombre_cliente || this.pedidoSeleccionado.cliente || '').toString().trim();
    const pedidoDocLimpio = (pedidoDoc === '-' || pedidoDoc === '00000000') ? '' : pedidoDoc;
    const pedidoNombreLimpio = (pedidoNombre === 'Sin cliente' || pedidoNombre === 'Cliente Varios') ? '' : pedidoNombre;

    const preparedData = {
      ...this.ventaForm.value,
      tipoComprobante: this.ventaForm.get('tipoComprobante')?.value || 'Boleta',
      documento_cliente: this.ventaForm.get('documento_cliente')?.value || pedidoDocLimpio || '',
      nombre_cliente: this.ventaForm.get('nombre_cliente')?.value || pedidoNombreLimpio || '',
      correo_cliente: this.ventaForm.get('correo_cliente')?.value || this.pedidoSeleccionado.email || '',
      direccion_cliente: this.ventaForm.get('direccion_cliente')?.value || this.pedidoSeleccionado.direccion_cliente || '',
      telefono_cliente: this.ventaForm.get('telefono_cliente')?.value || this.pedidoSeleccionado.telefono || '',
      cliente: this.ventaForm.get('cliente')?.value || (pedidoNombreLimpio || pedidoDocLimpio ? {
        nombre_o_razon_social: pedidoNombreLimpio,
        nombre_completo: pedidoNombreLimpio,
        ruc: pedidoDocLimpio,
        numero: pedidoDocLimpio,
      } : null),
      estado: this.ventaForm.get("is_send_sunat")?.value,
      is_save_user: this.ventaForm.get("is_save_user")?.value,
      is_pedido: true,
      pedido_id: this.pedidoSeleccionado.id,
    };

    this.store.dispatch(crearVenta({ venta: preparedData }));

    this.actions$.pipe(
      ofType(crearVentaExito),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(({ venta }: any) => {
      // Marcar pedido como pagado (sale de pendientes)
      this.store.dispatch(pagarPedido({
        pedidoId: this.pedidoSeleccionado.id,
        data: { estado: 'COMPLETADO', estado_pago: 'PAGADO' }
      }));

      this.alerts.open('Venta realizada', {
        label: `${this.pedidoSeleccionado.numero_pedido} procesado como venta correctamente`,
        appearance: "success"
      }).subscribe();

      if (venta) {
        this.dialogServiceVentaDetail.open(venta).subscribe();
      }

      while (this.productosFormArray.length) {
        this.productosFormArray.removeAt(0);
      }
      this.pedidoSeleccionado = null;
      this.pedidoFlowStep = 0;
      this.borrarCliente();
      this.calcularTotales();
      this.cargarPedidosPendientes();
      this.processingVenta = false;
    });

    // Manejar error
    this.actions$.pipe(
      ofType(crearVentaError),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.processingVenta = false;
    });
  }

  actualizarCostoTotal(productoForm: FormGroup, descuento: number) {

  }

  /** SUNAT listo solo si hay clave SOL y certificado (flags del GET). */
  get sunatOK(): boolean {
    return this.tieneSol && this.tieneCertificado;
  }
  /** Bloquea la venta electrónica si falta configuración SUNAT (no aplica a anónima ni sin envío SUNAT). */
  get sunatBloqueaVenta(): boolean {
    if (this.ventaForm?.get('tipoComprobante')?.value === 'Anonima') return false;
    if (this.ventaForm?.get('is_send_sunat')?.value === false) return false;
    return !this.sunatOK;
  }

  get sunatFaltante(): string {
    const faltan: string[] = [];
    if (!this.tieneSol) faltan.push('clave SOL');
    if (!this.tieneCertificado) faltan.push('certificado');
    return faltan.length ? 'Falta: ' + faltan.join(' + ') : '';
  }

  /** Carga límites del plan y uso del mes para bloquear la venta al llegar al límite. */
  loadPlanLimits(): void {
    const id = Number(this.tiendaUser);
    if (!id || this.planLimitsLoadedForTienda === id) return;
    this.planLimitsLoadedForTienda = id;
    this.tiendaService.getPlanYSuscripcion(id).subscribe({
      next: (data) => {
        const plan: any = data?.plan_actual;
        const uso: any = data?.uso_mensual;
        const s: any = data as any;
        this.planLimiteBoletas = plan?.limite_boletas ?? null;
        this.planLimiteFacturas = plan?.limite_facturas ?? null;
        this.usoBoletas = Number(uso?.boletas_emitidas ?? uso?.total_boletas ?? 0);
        this.usoFacturas = Number(uso?.facturas_emitidas ?? uso?.total_facturas ?? 0);
        this.planDiasRestantes = s?.plan_dias_restantes ?? null;
        this.planHasta = s?.plan_hasta ?? null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.planLimitsLoadedForTienda = null;
      },
    });
  }

  private esIlimitado(limite: number | null): boolean {
    return Number(limite ?? 0) >= 999999;
  }

  /** Tipo con límite alcanzado según el comprobante elegido, o null si puede vender. */
  get limiteAlcanzadoTipo(): 'Boleta' | 'Factura' | null {
    const tipo = this.ventaForm?.get('tipoComprobante')?.value;
    if (tipo === 'Boleta' && this.planLimiteBoletas != null && !this.esIlimitado(this.planLimiteBoletas)) {
      if (this.usoBoletas >= Number(this.planLimiteBoletas)) return 'Boleta';
    }
    if (tipo === 'Factura' && this.planLimiteFacturas != null && !this.esIlimitado(this.planLimiteFacturas)) {
      if (this.usoFacturas >= Number(this.planLimiteFacturas)) return 'Factura';
    }
    return null;
  }

  get limiteFechaReset(): string | null {
    if (!this.planHasta) return null;
    const d = new Date(this.planHasta);
    if (isNaN(d.getTime())) return null;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  /** Barra inferior móvil: se oculta solo al elegir pedido (paso 0). */
  get barraMovilVisible(): boolean {
    if (this.activeTab === 'pedido' && this.pedidoFlowStep === 0) return false;
    return true;
  }

  get barraMovilEsAnonima(): boolean {
    return this.activeTab !== 'pedido' && this.ventaForm?.get('tipoComprobante')?.value === 'Anonima';
  }

  get barraMovilDeshabilitada(): boolean {
    if (this.activeTab === 'pedido') {
      return (this.productosFormArray?.length ?? 0) === 0 || this.processingVenta;
    }
    const sinLineas = this.lineasProductos().length === 0;
    if (this.barraMovilEsAnonima) return sinLineas;
    return !this.ventaForm?.valid || sinLineas || this.sunatBloqueaVenta;
  }

  accionMovil(): void {
    if (this.activeTab === 'pedido' && this.pedidoFlowStep > 0) {
      this.confirmarVentaPedido();
      return;
    }
    this.hacerVenta();
  }

  hacerVenta() {
    this.rucRequiredError.set(false);

    const limiteTipo = this.limiteAlcanzadoTipo;
    if (limiteTipo) {
      const esBoleta = limiteTipo === 'Boleta';
      this.dialogLimiteAlcanzado.open({
        tipo: limiteTipo,
        usados: esBoleta ? this.usoBoletas : this.usoFacturas,
        limite: Number(esBoleta ? this.planLimiteBoletas : this.planLimiteFacturas),
        diasRestantes: this.planDiasRestantes != null ? Number(this.planDiasRestantes) : null,
        fechaReset: this.limiteFechaReset,
      }).subscribe((verPlan) => {
        if (verPlan) this.router.navigate(['/app/settings/suscripcion']);
      });
      return;
    }

    if (this.sunatBloqueaVenta) {
      this.alerts.open('Configura tus credenciales SUNAT en Ajustes', {
        label: 'SUNAT sin configurar',
      }).subscribe();
      return;
    }

    const tipoComprobante = this.ventaForm.get('tipoComprobante')?.value;
    const documento = this.ventaForm.get('documento_cliente')?.value?.toString() || '';

    const isFactura = tipoComprobante === 'Factura';
    const isDNI = documento.length === 8;

    if (isFactura && isDNI) {
      this.rucRequiredError.set(true);
      this.cdr.detectChanges();
      return;
    }

    const preparedData = {
      ...this.ventaForm.value,
      correo_cliente: this.ventaForm.get('correo_cliente')?.value || '',
      direccion_cliente: this.ventaForm.get('direccion_cliente')?.value || '',
      telefono_cliente: this.ventaForm.get('telefono_cliente')?.value || '',
      estado: this.ventaForm.get("is_send_sunat")?.value,
      is_save_user: this.ventaForm.get("is_save_user")?.value
    }

    this.store.dispatch(crearVenta({ venta: preparedData }));

    this.actions$.pipe(
      ofType(crearVentaExito),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.borrarCliente();
      this.calcularTotales();
    });

  }
  get productosFormArray(): FormArray<FormGroup> {
    return this.ventaForm.get('productos') as FormArray<FormGroup>;
  }
  protected readonly columns = ['producto_nombre', 'cantidad_final', 'costo_venta', 'acciones'];

  eliminarProductoForm(index: number) {
    this.productosFormArray.removeAt(index);
    this.calcularTotales();
  }


  onSetImageProduct(img: any) {
    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";
    if (!img) return placeholder;
    const imgStr = String(img);
    if (imgStr.startsWith('http')) return imgStr;
    return URL_BASE + imgStr;
  }



  convertirNumeroALetras(numero: number): string {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    if (numero === 0) return 'CERO CON 00/100 SOLES';
    if (numero === 100) return 'CIEN CON 00/100 SOLES';

    const parteEntera = Math.floor(numero);
    const parteDecimal = Math.round((numero - parteEntera) * 100);

    const convertirGrupo = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return unidades[n];
      if (n < 20) return especiales[n - 10];
      if (n < 100) {
        const d = Math.floor(n / 10);
        const u = n % 10;
        return decenas[d] + (u > 0 ? ' Y ' + unidades[u] : '');
      }
      if (n < 1000) {
        const c = Math.floor(n / 100);
        const resto = n % 100;
        return centenas[c] + (resto > 0 ? ' ' + convertirGrupo(resto) : '');
      }
      if (n < 1000000) {
        const miles = Math.floor(n / 1000);
        const resto = n % 1000;
        return (miles === 1 ? 'MIL' : convertirGrupo(miles) + ' MIL') + (resto > 0 ? ' ' + convertirGrupo(resto) : '');
      }
      if (n < 1000000000) {
        const millones = Math.floor(n / 1000000);
        const resto = n % 1000000;
        return (millones === 1 ? 'UN MILLON' : convertirGrupo(millones) + ' MILLONES') + (resto > 0 ? ' ' + convertirGrupo(resto) : '');
      }
      return 'NUMERO DEMASIADO GRANDE';
    };

    const letras = convertirGrupo(parteEntera);
    const decimal = parteDecimal.toString().padStart(2, '0');
    return `${letras} CON ${decimal}/100 SOLES`;
  }

  documentoValidator(tipoControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toString() ?? '';
      if (!value) return { required: true };

      const isNumeric = /^[0-9]+$/.test(value);
      if (!isNumeric) return { numeric: true };

      if (tipoControl === 'Boleta' && value.length !== 8) {
        return { length: true };
      }

      if (tipoControl === 'Factura' && value.length !== 11) {
        return { length: true };
      }

      return null; // ✅ válido
    };

  }
  // cod barras

  private barcodeBuffer: string = '';
  private barcodeTimeout: any;
  private readonly BARCODE_TIMEOUT = 100; // milisegundos
  private readonly MIN_BARCODE_LENGTH = 3; // ajusta según tus códigos

  @HostListener('window:keypress', ['$event'])
  handleKeypress(event: KeyboardEvent) {
    // Ignorar si el usuario está escribiendo en un input, textarea o select
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return; // Dejar que el input normal funcione
    }

    // Si es Enter, procesar el código
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length >= this.MIN_BARCODE_LENGTH) {
        this.procesarCodigoBarras(this.barcodeBuffer);
      }
      this.barcodeBuffer = '';
      clearTimeout(this.barcodeTimeout);
      return;
    }

    // Acumular caracteres
    this.barcodeBuffer += event.key;

    // Resetear buffer si pasa mucho tiempo (es escritura humana)
    clearTimeout(this.barcodeTimeout);
    this.barcodeTimeout = setTimeout(() => {
      this.barcodeBuffer = '';
    }, this.BARCODE_TIMEOUT);
  }

  procesarCodigoBarras(codigo: string) {

    // Aquí ejecutas tu función
    this.onBarcodeScanned(codigo);
  }

  tuFuncion(codigo: string) {
    // Tu lógica aquí
    alert(`Código escaneado: ${codigo}`);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.barcodeTimeout);
  }



}



