


import { BarcodeScannerComponent } from "@/app/components/bardcode-scanner/bardcode-scanner.component";
import { Cliente } from "@/app/models/cliente.models";
import { Inventario } from '@/app/models/inventario.models';
import { ConsultaService } from '@/app/services/consultas.service';
import { DialogService } from '@/app/services/dialogs-services/dialog.service';
import { normalizeSku } from "@/app/services/search-services/producto-search.service";
import { URL_BASE } from "@/app/services/utils/endpoints";
import { updateStockMultiple } from "@/app/state/actions/inventario.actions";
import { crearVenta, crearVentaExito } from "@/app/state/actions/venta.actions";
import { AppState } from '@/app/state/app.state';
import { selectClienteState } from "@/app/state/selectors/cliente.selectors";
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { selectCurrenttUser, selectPermissions, selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Actions, ofType } from "@ngrx/effects";
import { Store } from '@ngrx/store';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiExpand, TuiIcon, TuiLabel, TuiLoader, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiCheckbox, TuiChip, TuiComboBox, TuiDataListWrapper, TuiFilter, TuiFilterByInputPipe, TuiInputNumber, TuiItemsWithMore, TuiRadio, TuiStepper, TuiTooltip } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { TuiComboBoxModule, TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { catchError, finalize, map, Observable, of, Subject, takeUntil, timeout } from 'rxjs';

@Component({
  selector: 'app-hacerventa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiCheckbox,
    TuiStepper,
    TuiInputModule,
    TuiTable,
    TuiItemsWithMore,
    TuiRadio,
    TuiDropdown,
    FormsModule,
    TuiAppBar,
    FormsModule,
    TuiTextfield,
    TuiInputNumber,
    TuiButton,
    BarcodeScannerComponent,
    TuiAppearance,
    TuiIcon,
    TuiDataList, TuiChip,
    AsyncPipe,
    NgForOf,
    TuiComboBoxModule,
    TuiAmountPipe,
    TuiDataListWrapper,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiLoader,
    TuiExpand,
    TuiComboBox,
    TuiTextfieldDropdownDirective,
    TuiTooltip,
    TuiLabel,
    FormsModule,
    TuiDataListWrapper,
    TuiFilterByInputPipe, TuiFilter,
    TuiTextfield, TuiTextfieldControllerModule
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
export class HacerventaComponent implements OnInit {
  protected expanded = false;
  private destroy$ = new Subject<void>();
  errorClientNotFound = false;
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
  formasPago = ["Contado"]
  protected readonly options = { updateOn: 'blur' } as const;
  loaderSearchCliente = false;

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
  userPermissions$ = this.store.select(selectPermissions);
  tiendaUser!: number
  userId!: number;
  inventarios!: Inventario[]
  clientes: Cliente[] = []
  URL_BASE = URL_BASE
  is_client_exists: boolean = false
  clienteSelected!: Cliente
  @ViewChild('containerAreaProducts') container!: ElementRef<HTMLDivElement>;


  // Detectar click dentro del div
  clickedInside() {
    this.container.nativeElement.style.borderColor = '#86efac'; // verde
  }

  // Detectar click fuera del div
  @HostListener('document:click', ['$event'])
  clickedOutside(event: MouseEvent) {
    const clickedInside = this.container.nativeElement.contains(event.target as Node);

    if (!clickedInside) {
      this.container.nativeElement.style.borderColor = '#9ca3af'; // gris
    }
  }
  // Esta función se ejecuta cuando el escáner detecta un código
  onBarcodeScanned(barcode_raw: string) {
    let barcode = normalizeSku(barcode_raw)
    console.log('Código escaneado:', barcode);

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
      console.log('Producto enconrado', productoEncontrado);
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
    this.loadingCreateVenta$ = this.store.select(selectVenta);
    this.showVentaDetailTemporary$ = this.store.select(selectVenta)
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })

    this.ventaForm = this.fb.group({
      usuarioId: [this.userId],
      metodoPago: [this.listMetodosPago[3], Validators.required],
      formaPago: [this.formasPago[0], Validators.required],
      tipoComprobante: [this.tipoComprobantes[0], Validators.required],
      cliente: [null, Validators.required],
      documento_cliente: [
        "",
        [
          (control: any) => this.documentoValidator(this.ventaForm?.get('tipoComprobante')?.value)(control)
        ]
      ],

      nombre_cliente: [""],
      correo_cliente: [""],
      direccion_cliente: [""],
      telefono_cliente: [""],
      productos: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      is_send_sunat: [true],
      is_save_user: [true],

    });

    this.productosFormArray.valueChanges.subscribe((tipo: any) => {
      const documentoCtrl = this.ventaForm.get('documento_cliente');
      documentoCtrl?.setValidators([this.documentoValidator(tipo)]);
      documentoCtrl?.updateValueAndValidity();
      this.validarStock();

      this.calcularTotales();
    });



  }
  documents: string[] = []
  ngOnInit() {
    console.log(this.documents)
    this.ventaForm.get('is_send_sunat')?.valueChanges
      .subscribe(value => {
        this.onChangeEnviarSunat(value);
      });

    this.store.select(selectInventario).subscribe((state) => {

      this.inventarios = state.inventarios
    })

    this.store.select(selectClienteState).subscribe((state) => {

      this.clientes = state.clientes

      this.documents = state.clientes.map((cliente: Cliente) => cliente.document);
      console.log("Documentos", state.clientes.map((cliente: Cliente) => cliente.document))
    })
    this.ventaForm.get('tipoComprobante')?.valueChanges.subscribe((nuevoValor) => {
      console.log('Tipo comprobante cambió a:', nuevoValor);

      // Resetea el documento del cliente
      this.borrarCliente()
      this.ventaForm.get('documento_cliente')?.reset('');
      this.ventaForm.get('cliente')?.reset(null);
    });




  }


  onChangeEnviarSunat(value: boolean) {
    this.ventaForm.get('is_send_sunat')?.setValue(value, { emitEvent: false });
  }

  validarStock(): void {
    this.productosFormArray.controls.forEach((control, index) => {
      const cantidad = parseInt(control.get('cantidad_final')?.value || '0');
      const stock = parseInt(control.get('stock_actual')?.value || '0');


      console.log({ stock_despues: stock - cantidad })
      if (stock - cantidad < 0) {
        console.log("Stock incifuciente")
        control.get('cantidad_final')?.setValue(1);
        this.alerts.open('No hay stock suficiente para agregar mas para este producto.', { label: 'Mensaje informacion', appearance: "warning" }).subscribe();
        // aca tienes que resetear el valor de cantidad final a 1
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



  buscarCliente() {
    this.errorClientNotFound = false
    let clienteSearh = this.clientes.find((el: Cliente) => {
      return el.document === this.ventaForm.get('documento_cliente')!.value;
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
    this.errorClientNotFound = false;
    const documento = this.ventaForm.get('documento_cliente')!.value;

    if (!documento) {
      return;
    }

    let consultaObservable =
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
      console.log(response)
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
          cliente: clienteForm
        });

        this.errorClientNotFound = false; // Resetea el error si hay datos
      } else {
        // No se encontró el documento

        this.errorClientNotFound = true;
        this.ventaForm.patchValue({
          nombre_cliente: '',
          cliente: null
        });
      }
    });

  }

  borrarCliente() {
    this.expanded = false
    this.ventaForm.patchValue({
      documento_cliente: '',
      nombre_cliente: '',
      cliente: null
    });
  }


  actualizarCostoTotal(productoForm: FormGroup, descuento: number) {

  }

  hacerVenta() {
    const preparedData = {
      ...this.ventaForm.value,
      estado: this.ventaForm.get("is_send_sunat")?.value,
      is_save_user: this.ventaForm.get("is_save_user")?.value
    }

    console.log(preparedData)
    this.store.dispatch(crearVenta({ venta: preparedData }));

    this.actions$.pipe(
      ofType(crearVentaExito),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.store.dispatch(updateStockMultiple({ productos: preparedData.productos }));
      this.borrarCliente()

      this.productosFormArray.clear();
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

    const imagenFinal = img == null
      ? URL_BASE + img
      : placeholder;
    console.log("Img", img)
    return imagenFinal;
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
    console.log('Código de barras detectado:', codigo);
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



