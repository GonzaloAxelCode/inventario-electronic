import { BarcodeScannerComponent } from "@/app/components/bardcode-scanner/bardcode-scanner.component";
import { Cliente } from "@/app/models/cliente.models";
import { Inventario } from '@/app/models/inventario.models';
import { CreatePedido } from '@/app/models/pedido.models';
import { ConsultaService } from '@/app/services/consultas.service';
import { DialogService } from '@/app/services/dialogs-services/dialog.service';
import { normalizeSku } from "@/app/services/search-services/producto-search.service";
import { URL_BASE } from "@/app/services/utils/endpoints";
import { crearPedido, crearPedidoExito } from "@/app/state/actions/pedido.actions";
import { AppState } from '@/app/state/app.state';
import { selectClienteState } from "@/app/state/selectors/cliente.selectors";
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { selectPedido } from '@/app/state/selectors/pedido.selectors';
import { selectCurrenttUser, selectPermissions, selectUsersState } from '@/app/state/selectors/user.selectors';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Actions, ofType } from "@ngrx/effects";
import { Store } from '@ngrx/store';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiPlatform } from "@taiga-ui/cdk";
import { TuiAlertService, TuiAppearance, TuiButton, TuiDropdown, TuiExpand, TuiIcon, TuiLabel, TuiLoader, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiCheckbox, TuiChip, TuiComboBox, TuiDataListWrapper, TuiFilter, TuiFilterByInputPipe, TuiInputNumber, TuiItemsWithMore, TuiRadio, TuiSegmented, TuiStepper, TuiSwitch, TuiTooltip } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { TuiComboBoxModule, TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { catchError, finalize, map, Observable, of, Subject, takeUntil, timeout } from 'rxjs';

@Component({
  selector: 'app-registrarpedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    TuiSwitch,
    TuiPlatform,
    TuiButton,
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
    BarcodeScannerComponent,
    TuiSegmented,
  ],
  animations: [
    trigger('expandCollapse', [
      state('open', style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '0px', opacity: 0 })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ])
  ],
  templateUrl: './registrarpedido.component.html',
  styleUrl: './registrarpedido.component.scss'
})
export class RegistrarpedidoComponent implements OnInit, OnDestroy {
  vistaActiva: 'buscar' | 'nuevo' = 'buscar';
  protected expanded = false;
  private destroy$ = new Subject<void>();
  errorClientNotFound = false;

  protected readonly units = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  protected value = this.units[0]!;
  salesTotals = {
    subtotal: 0,
    igv: 0,
    total: 0,
    descuentoTotales: 0
  };
  pedidoForm: FormGroup;
  listMetodosPago = [" YAPE", "PLIN", "Transferencia(No disponible)", "Efectivo"]
  formasPago = ["Contado"]
  protected readonly options = { updateOn: 'blur' } as const;
  loaderSearchCliente = false;

  protected allProductsForSale: any[] = [];
  arrayCantidades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  selectedItem: string = '1';
  protected sum(operations: readonly any[]): number {
    return operations.reduce((acc, { sum }) => acc + (sum || 0), 0);
  }

  protected orderBy(): number {
    return 0;
  }
  protected loadingCreatePedido$: Observable<any>
  private readonly store = inject(Store<AppState>);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogService = inject(DialogService);
  userPermissions$ = this.store.select(selectPermissions);
  tiendaUser!: number
  userId!: number;
  inventarios!: Inventario[]
  clientes: Cliente[] = []
  URL_BASE = URL_BASE
  is_client_exists: boolean = false
  clienteSelected!: Cliente
  @ViewChild('containerAreaProducts') container!: ElementRef<HTMLDivElement>;

  changeModeClient(valor: any) {
    this.vistaActiva = valor;

    this.pedidoForm.patchValue({
      cliente: null,
      documento_cliente: '',
      nombre_cliente: '',
      correo_cliente: '',
      direccion_cliente: '',
      telefono_cliente: '',
      documento_cliente_existente: ''
    });

    const docExistenteControl = this.pedidoForm.get('documento_cliente_existente');
    const docNuevoControl = this.pedidoForm.get('documento_cliente');

    if (this.vistaActiva === 'buscar') {
      docExistenteControl?.setValidators([Validators.required]);
      docNuevoControl?.clearValidators();
    } else {
      docExistenteControl?.clearValidators();
      docNuevoControl?.setValidators([Validators.required]);
    }

    docExistenteControl?.updateValueAndValidity();
    docNuevoControl?.updateValueAndValidity();
  }

  clickedInside() {
    this.container.nativeElement.style.borderColor = '#86efac';
  }

  @HostListener('document:click', ['$event'])
  clickedOutside(event: MouseEvent) {
    const clickedInside = this.container.nativeElement.contains(event.target as Node);

    if (!clickedInside) {
      this.container.nativeElement.style.borderColor = '#9ca3af';
    }
  }

  onBarcodeScanned(barcode_raw: string) {
    const barcode = normalizeSku(barcode_raw)

    const productoEncontrado = this.inventarios
      .filter(inv => inv.activo === true)
      .find(inv => inv.producto_sku === barcode);

    if (!productoEncontrado) {
      this.alerts.open('Producto no encontrado', {
        label: `No se encontró un producto con el código: ${barcode} o esta desactivado.`,
        appearance: "warning"
      }).subscribe();
      return;
    }

    const productosArray = this.pedidoForm.get('productos') as FormArray;
    const productoExiste = productosArray.controls.some(
      control => control.get('inventarioId')?.value === productoEncontrado.id
    );

    if (productoExiste) {
      const productoControl = productosArray.controls.find(
        control => control.get('inventarioId')?.value === productoEncontrado.id
      );

      if (productoControl) {
        const cantidadActual = parseInt(productoControl.get('cantidad_final')?.value || '0');
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
          label: `El producto no tiene costo. Actualiza el costo del producto.`,
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

    this.calcularTotales();
    this.cdr.markForCheck();
  }

  constructor(private fb: FormBuilder, private consultaService: ConsultaService, private cdr: ChangeDetectorRef, private actions$: Actions) {
    this.loadingCreatePedido$ = this.store.select(selectPedido);
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })

    this.pedidoForm = this.fb.group({
      usuarioId: [this.userId],
      metodoPago: [this.listMetodosPago[3], Validators.required],
      formaPago: [this.formasPago[0], Validators.required],
      cliente: [null, Validators.required],
      documento_cliente: ["", [Validators.required]],
      nombre_cliente: ["", Validators.required],
      correo_cliente: [""],
      direccion_cliente: [""],
      telefono_cliente: [""],
      documento_cliente_existente: ["", this.vistaActiva === "buscar" && Validators.required],
      productos: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      observaciones: [""],
    });

    this.productosFormArray.valueChanges.subscribe(() => {
      this.calcularTotales();
    });
  }

  documents: string[] = []
  ngOnInit() {
    this.store.select(selectInventario).subscribe((state) => {
      this.inventarios = state.inventarios
    })

    this.store.select(selectClienteState).subscribe((state) => {
      this.clientes = state.clientes

      this.documents = state.clientes
        .filter((cliente: Cliente) => cliente.document !== '00000000')
        .map((cliente: Cliente) => cliente.document + "-" + cliente.fullname);
    })

    this.pedidoForm.get('documento_cliente_existente')?.valueChanges.subscribe((docraw) => {
      if (!docraw) return;

      const doc = docraw.split('-')[0].trim();
      const clienteEncontrado = this.clientes.find((cliente: Cliente) => cliente.document === doc);

      if (clienteEncontrado) {
        this.pedidoForm.patchValue({
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

  protected showDialog(): void {
    this.dialogService.open().subscribe((result: any) => {

      if (result) {

        const productosArray = this.pedidoForm.get('productos') as FormArray;
        const productoExiste = productosArray.controls.some(control => control.get('inventarioId')?.value === result.id);
        if (productoExiste) {
          this.alerts.open('Mensaje informacion', { label: 'Producto ya esta agregado', appearance: "warning" }).subscribe();
          return;
        }
        const nuevoProducto = this.fb.group({
          inventarioId: [result.id],
          cantidad_final: ["1", [Validators.required]],
          producto_nombre: [result.producto_nombre],
          nombre_categoria: [result.categoria_nombre],
          costo_venta: [result.costo_venta],
          productoId: [result.producto.id],
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

  buscarCliente() {
    this.errorClientNotFound = false
    const clienteSearh = this.clientes.find((el: Cliente) => {
      return el.document === this.pedidoForm.get('documento_cliente')!.value;
    })
    if (clienteSearh) {
      const clienteForm = {
        nombre_o_razon_social: clienteSearh.fullname,
        nombre_completo: clienteSearh.fullname,
        ruc: clienteSearh.document,
        numero: clienteSearh.document,
      };

      this.pedidoForm.patchValue({
        nombre_cliente: clienteForm.nombre_completo,
        cliente: clienteForm
      });
      this.is_client_exists = true
      this.clienteSelected = clienteSearh
      return;
    }
    this.errorClientNotFound = false;
    const documento = this.pedidoForm.get('documento_cliente')!.value;

    if (!documento) {
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
      timeout(5000),
      catchError(error => {
        console.error('Error al consultar documento:', error);
        this.errorClientNotFound = true;
        return of(null);
      }),
      finalize(() => {
        this.loaderSearchCliente = false;
        this.cdr.detectChanges();
      })
    ).subscribe(response => {

      if (response && (response.nombre_completo || response.nombre_o_razon_social)) {
        const data = response;

        const clienteForm = {
          nombre_o_razon_social: data.nombre_o_razon_social || data.nombre_completo || '',
          nombre_completo: data.nombre_completo || data.nombre_o_razon_social || '',
          ruc: data.ruc || '',
          numero: data.numero || '',
        };

        this.pedidoForm.patchValue({
          nombre_cliente: clienteForm.nombre_completo || clienteForm.nombre_o_razon_social,
          cliente: clienteForm
        });

        this.errorClientNotFound = false;
      } else {
        this.errorClientNotFound = true;
        this.pedidoForm.patchValue({
          nombre_cliente: '',
          cliente: null, documento_cliente_existente: ""
        });
      }
    });

  }

  borrarCliente() {
    this.expanded = false
    this.pedidoForm.patchValue({
      documento_cliente: '',
      nombre_cliente: '',
      cliente: null,
      documento_cliente_existente: ""
    });
  }

  actualizarCostoTotal(productoForm: FormGroup, descuento: number) {

  }

  registrarPedido() {
    const formValue = this.pedidoForm.value;
    const createPedido: CreatePedido = {
      cliente: {
        tipo_documento: formValue.cliente?.ruc?.length === 11 ? '6' : '1',
        numero: formValue.documento_cliente || formValue.cliente?.numero || '',
        nombre_completo: formValue.nombre_cliente || formValue.cliente?.nombre_completo || '',
        correo_cliente: formValue.correo_cliente || undefined,
        telefono_cliente: formValue.telefono_cliente || undefined,
        direccion_cliente: formValue.direccion_cliente || undefined,
      },
      metodoPago: formValue.metodoPago,
      observaciones: formValue.observaciones || undefined,
      productos: formValue.productos.map((p: any) => ({
        inventarioId: p.inventarioId,
        cantidad_final: parseInt(p.cantidad_final),
        descuento: p.descuento || 0,
      })),
    };

    this.store.dispatch(crearPedido({ pedido: createPedido }));

    this.actions$.pipe(
      ofType(crearPedidoExito),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.borrarCliente();
      this.pedidoForm.get('productos')?.reset([]);
      this.calcularTotales();
    });
  }

  get productosFormArray(): FormArray<FormGroup> {
    return this.pedidoForm.get('productos') as FormArray<FormGroup>;
  }
  protected readonly columns = ['producto_nombre', 'cantidad_final', 'costo_venta', 'acciones'];

  eliminarProductoForm(index: number) {
    this.productosFormArray.removeAt(index);
    this.calcularTotales();
  }

  onSetImageProduct(img: any) {
    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";
    const imagenFinal = img == null ? URL_BASE + img : placeholder;
    return imagenFinal;
  }

  private barcodeBuffer: string = '';
  private barcodeTimeout: any;
  private readonly BARCODE_TIMEOUT = 100;
  private readonly MIN_BARCODE_LENGTH = 3;

  @HostListener('window:keypress', ['$event'])
  handleKeypress(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();

    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return;
    }

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length >= this.MIN_BARCODE_LENGTH) {
        this.onBarcodeScanned(this.barcodeBuffer);
      }
      this.barcodeBuffer = '';
      clearTimeout(this.barcodeTimeout);
      return;
    }

    this.barcodeBuffer += event.key;

    clearTimeout(this.barcodeTimeout);
    this.barcodeTimeout = setTimeout(() => {
      this.barcodeBuffer = '';
    }, this.BARCODE_TIMEOUT);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.barcodeTimeout);
  }
}
