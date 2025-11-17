import { Categoria } from '@/app/models/categoria.models';
import { Inventario } from '@/app/models/inventario.models';
import { Producto, ProductoState } from '@/app/models/producto.models';
import { Proveedor } from '@/app/models/proveedor.models';
import { TiendaState } from '@/app/models/tienda.models';
import { DialogEditInventarioDetailService } from '@/app/services/dialogs-services/dialog-edit-inventario.service';
import { QuerySearchInventario } from '@/app/services/inventario.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { clearSearchInventarios, createInventario, eliminarInventarioAction, searchInventarios } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { selectProveedorState } from '@/app/state/selectors/proveedor.selectors';
import { selectPermissions, selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { tuiCountFilledControls } from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiDataList, TuiExpand, TuiLink, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiChevron, TuiConfirmData, TuiConfirmService, TuiDataListWrapper, TuiFilter, TuiPagination, TuiPreview, TuiPreviewDialogDirective, TuiPreviewTitle, TuiSegmented, TuiSkeleton, TuiStatus, TuiSwitch, tuiValidationErrorsProvider } from '@taiga-ui/kit';
import { TuiBlockDetails, TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiInputRangeModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { map, Observable } from 'rxjs';
@Component({
  selector: 'app-tableinventario',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiDataList,
    TuiSelectModule,
    TuiTextareaModule,
    TuiButton,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiInputModule, TuiAppearance, TuiAppearance, TuiTable, TuiBadge,
    TuiBlockDetails, TuiSelectModule,
    TuiBadge, TuiButton, TuiAppearance, TuiStatus, TuiSegmented, NgForOf,
    ReactiveFormsModule,
    TuiButton, TuiStatus,
    TuiChevron, TuiInputRangeModule,
    TuiDataListWrapper,
    TuiFilter,
    TuiLink,
    TuiSearch,
    TuiSegmented, TuiSkeleton,
    TuiSwitch, TuiExpand,
    TuiTextfield, TuiLoader, TuiPagination, TuiBlockStatus, TuiSkeleton,
    TuiPreview, TuiPreviewTitle, TuiPreviewDialogDirective,
  ],
  templateUrl: './tableinventario.component.html',
  providers: [tuiValidationErrorsProvider({
    required: 'Required field',
  }), TuiConfirmService, { provide: 'Pythons', useValue: ['Python One', 'Python Two', 'Python Three'] }, TuiConfirmService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './tableinventario.component.scss'
})
export class TableinventarioComponent {
  @Input() mode?: string
  @Input() cerrarDialogo!: (valor: Inventario) => void;
  value = [0, 0];
  URL_BASE = URL_BASE
  userPermissions$ = this.store.select(selectPermissions);
  inventariosState$?: Observable<InventarioState>;
  tiendasState$?: Observable<TiendaState>
  productState$?: Observable<ProductoState>
  inventarioForm2!: FormGroup;
  productos: Producto[] = [];
  proveedores: any[] = [];
  inventarios!: Inventario[]
  private readonly dialogs = inject(TuiResponsiveDialogService);

  private readonly dialogEditInventarioService = inject(DialogEditInventarioDetailService);
  allColumns = this.mode === "normal" ? [
    { key: 'producto_sku', label: 'Codigo Sku' },
    { key: 'producto_nombre', label: 'Producto' },

    { key: 'stock_minimo', label: 'Stock Mínimo' },
    { key: 'stock_maximo', label: 'Stock Máximo' },
  ] : [

    { key: 'producto_sku', label: 'Codigo Sku' },
    { key: 'producto_nombre', label: 'Producto' },

  ];
  allColumnKeys = this.allColumns.map(c => c.key);
  protected expanded = false;
  protected open = false;
  protected index = 0;
  protected length = 1;
  protected readonly form = new FormGroup({
    nombre: new FormControl(),
    producto_sku: new FormControl(),
    categoria: new FormControl<any>(null),
    proveedor: new FormControl<any>(null),
    activo: new FormControl(), // Rango de stock (array [min, max])
    stockRange: new FormControl<[number, number] | null>(null),
    precioCompraRange: new FormControl<[number, number] | null>(null),
    precioVentaRange: new FormControl<[number, number] | null>(null)
  });
  filteredData: any = []

  displayedColumns = [...this.allColumnKeys];
  selectCategorias$?: Observable<Categoria[]>;
  selectProveedores$?: Observable<Proveedor[]>;
  tiendaUser!: number
  isTheSearchWasDone: boolean = false
  compareCategorias = (a: Categoria, b: Categoria) => a && b && a.id === b.id;
  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
  }
  protected readonly count = toSignal(
    this.form.valueChanges.pipe(map(() => tuiCountFilledControls(this.form))),
    { initialValue: 0 },
  );
  clearSearch() {
    this.store.dispatch(clearSearchInventarios());
    this.isTheSearchWasDone = false
  }
  onSubmitSearch() {
    const values = this.form.value;

    const searchQuery: Partial<QuerySearchInventario> = {
      nombre: (this.form.value.nombre || "").trim(),
      producto_sku: (this.form.value.producto_sku || "").trim(),
      categoria: this.form.value?.categoria?.id || 0,
      stock_min: values.stockRange?.[0] ?? null,
      stock_max: values.stockRange?.[1] ?? null,
      precio_compra_min: values.precioCompraRange?.[0] ?? null,
      precio_compra_max: values.precioCompraRange?.[1] ?? null,

      precio_venta_min: values.precioVentaRange?.[0] ?? null,
      precio_venta_max: values.precioVentaRange?.[1] ?? null,
    }
    console.log(searchQuery)

    this.store.dispatch(searchInventarios({ inventarios: this.inventarios, query: searchQuery }))
    this.isTheSearchWasDone = true
  }


  ngOnInit() {
    this.store.select(selectInventario).subscribe((state) => {

      this.inventarios = state.inventarios
    })
    this.store.select(selectProductoState).subscribe((state: ProductoState) => {
      this.productos = state.productos;
    });

    this.store.select(selectProveedorState).subscribe((state: ProveedorState) => {
      this.proveedores = state.proveedores;
    });


    this.inventariosState$ = this.store.select(selectInventario);
    this.selectCategorias$ = this.store.select(selectCategoria).pipe(
      map((state: CategoriaState) => state.categorias)
    );
    this.selectProveedores$ = this.store.select(selectProveedorState).pipe(
      map((state: ProveedorState) => state.proveedores)
    );


    this.form.valueChanges.subscribe(values => {
      this.onSubmitSearch()
    });

  }
  onSubmit(): void {
    if (this.inventarioForm2.valid) {

      const preparedData = {
        ...this.inventarioForm2.value,
        producto: this.inventarioForm2.value.producto.id,
        proveedor: this.inventarioForm2.value.proveedor.id,
      }

      this.store.dispatch(createInventario({ inventario: preparedData }));
    }
    this.isTheSearchWasDone = true
  }

  stringify = (item: { id: number; nombre: string } | null) => item ? item.nombre : '';
  getInventarioValue(inventario: any, key: string): any {
    return inventario[key as keyof any];
  }
  getColorClass(cantidad: number): string {
    if (cantidad >= 0 && cantidad <= 3) {
      return 'text-red-500';
    } else if (cantidad >= 4 && cantidad <= 10) {
      return 'text-yellow-400';
    } else {
      return 'text-green-400';
    }
  }

  eliminarInventario(inventarioId: number) {

    const data: TuiConfirmData = {
      content: '¿Estás seguro de que deseas eliminar este inventario?',
      yes: 'Eliminar',
      no: 'Cancelar',

    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirmación de Eliminación',
        size: 's',
        data,
      })
      .subscribe((confirm) => {
        if (confirm) {

          this.store.dispatch(eliminarInventarioAction({ inventarioId }));

        }
      });
  }


  protected showDialogEditInventario(currentInventario: Partial<Inventario>): void {
    this.dialogEditInventarioService.open(currentInventario).subscribe((result: any) => {
    });
  }
  protected titles = ["Producto Sin Imagen"]
  protected content = ['https://st2.depositphotos.com/1561359/12101/v/950/depositphotos_121012076-stock-illustration-blank-photo-icon.jpg']
  onSetImageProduct(inventario: Inventario) {

    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";

    const imagenFinal = inventario?.imagen_producto
      ? URL_BASE + inventario.imagen_producto
      : placeholder;

    this.titles = [inventario.producto_nombre || "Producto Sin Nombre"];
    this.content = [imagenFinal];
  }
  mostrarAdvertencia(name: any) {
    return name?.includes("(Delete)")
      ? "⚠️ Producto Eliminado"
      : "";
  }

}
