

import { TIENDA_ID } from '@/app/constants/tienda-vars';
import { ConsultaService } from '@/app/services/consultas.service';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { DialogService } from '@/app/services/dialogs-services/dialog.service';
import { crearVenta } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { selectAuth } from '@/app/state/selectors/auth.selectors';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiLoader, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiCheckbox, TuiDataListWrapper, TuiItemsWithMore, TuiRadio, TuiStepper } from '@taiga-ui/kit';
import { TuiAppBar, TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { catchError, finalize, Observable, of, timeout } from 'rxjs';

@Component({
  selector: 'app-hacerventa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    TuiCheckbox,
    TuiStepper,
    TuiTable,
    TuiItemsWithMore,

    TuiRadio,
    TuiDropdown,

    FormsModule,


    TuiAppBar,
    TuiTextfield,
    TuiInputModule,
    TuiButton,
    TuiAppearance,
    TuiDataList, AsyncPipe, NgForOf,
    TuiCardLarge, TuiHeader, TuiCell, TuiTitle, TuiAmountPipe,
    TuiDataListWrapper, TuiSelectModule,
    TuiTextfieldControllerModule, TuiLoader
  ],
  providers: [
    { provide: 'Pythons', useValue: ['Python One', 'Python Two', 'Python Three'] },
  ],
  templateUrl: './hacerventa.component.html',
  styleUrl: './hacerventa.component.scss',


})
export class HacerventaComponent implements OnInit {


  selectCurrentStep = signal("Start Up");
  protected readonly units = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  protected value = this.units[0]!;
  salesTotals = {
    subtotal: 0,
    igv: 0,
    total: 0
  };
  ventaForm: FormGroup;
  listMetodosPago = [" YAPE", "PLIN", "Transferencia(No disponible)", "Efectivo"]
  tipoComprobantes = ["Boleta", "Factura", "Sin Comprobante"]
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
  protected loadingCreateVenta$: Observable<any>
  protected showVentaDetailTemporary$: Observable<any>
  private readonly store = inject(Store<AppState>);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogService = inject(DialogService);


  userId: number = 0;
  constructor(private fb: FormBuilder, private consultaService: ConsultaService, private cdr: ChangeDetectorRef) {
    this.loadingCreateVenta$ = this.store.select(selectVenta);
    this.showVentaDetailTemporary$ = this.store.select(selectVenta)

    this.store.pipe(select(selectAuth)).subscribe(authState => {
      this.userId = Number(authState?.id_user) || 0;
    });

    this.ventaForm = this.fb.group({

      tiendaId: [TIENDA_ID],
      usuarioId: [this.userId],

      metodoPago: [this.listMetodosPago[1], Validators.required],
      formaPago: [this.formasPago[0], Validators.required],
      tipoComprobante: [this.tipoComprobantes[0], Validators.required],
      cliente: [null, Validators.required],
      documento_cliente: ["76881855"],
      nombre_cliente: [""],
      productos: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      is_send_sunat: [true]


    });
    this.productosFormArray.valueChanges.subscribe(() => {
      this.validarStock();

      this.calcularTotales();
    });


  }
  ngOnInit() {
    this.ventaForm.get('is_send_sunat')?.valueChanges
      .subscribe(value => {
        this.onChangeEnviarSunat(value);
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
        console.log("Stck incifuciente")
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
    const IGV_RATE = 0.18;

    this.productosFormArray.controls.forEach(control => {
      const cantidad = parseInt(control.get('cantidad_final')?.value || '0');
      const costoVenta = parseFloat(control.get('costo_venta')?.value || '0');

      const valorVenta = cantidad * costoVenta;
      subtotal += valorVenta;
    });

    igv = subtotal * IGV_RATE;
    total = subtotal;

    this.salesTotals = { subtotal: total - igv, igv, total };
  }


  protected showDialog(): void {
    this.dialogService.open().subscribe((result: any) => {

      if (result) {
        console.log(result)
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
          stock_actual: [result.cantidad]
        });
        productosArray.push(nuevoProducto);
        this.calcularTotales();
        this.cdr.markForCheck();
      }
    });
  }

  buscarCliente() {
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
        // Si hay error o timeout, devolvemos null
        return of(null);
      }),
      finalize(() => {
        // Siempre se ejecuta, éxito o error
        this.loaderSearchCliente = false;
        this.cdr.detectChanges();
      })
    ).subscribe(response => {
      if (response?.data) {
        this.ventaForm.patchValue({
          nombre_cliente: response.data.nombre_completo || response.data.nombre_o_razon_social,
          cliente: response.data
        });
      } else {
        this.ventaForm.patchValue({
          nombre_cliente: '',
          cliente: null
        });
      }
    });
  }

  borrarCliente() {
    this.ventaForm.patchValue({
      documento_cliente: '',
      nombre_cliente: '',
      cliente: null
    });
  }

  hacerVenta() {
    const preparedData = {
      ...this.ventaForm.value,
      estado: this.ventaForm.get("is_send_sunat")?.value
    }
    console.log(preparedData)

    this.store.dispatch(crearVenta({ venta: preparedData }));


  }
  get productosFormArray(): FormArray<FormGroup> {
    return this.ventaForm.get('productos') as FormArray<FormGroup>;
  }
  protected readonly columns = ['producto_nombre', 'cantidad_final', 'costo_venta', 'acciones'];

  eliminarProductoForm(index: number) {
    this.productosFormArray.removeAt(index);
    this.calcularTotales();
  }
  private readonly dialogServiceVentaDetail = inject(DialogVentaDetailService);

}