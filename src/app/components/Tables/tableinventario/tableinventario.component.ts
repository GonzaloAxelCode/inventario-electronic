import { Categoria } from '@/app/models/categoria.models';
import { Inventario } from '@/app/models/inventario.models';
import { Producto, ProductoState } from '@/app/models/producto.models';
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
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { tuiCountFilledControls } from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiDataList, TuiExpand, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiChip, TuiConfirmData, TuiConfirmService, TuiDataListWrapper, TuiPreview, TuiPreviewDialogDirective, TuiPreviewTitle, TuiSkeleton, TuiStatus, tuiValidationErrorsProvider } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiInputRangeModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { map, Observable, Subject, takeUntil } from 'rxjs';

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
    TuiChip,
    TuiInputModule,
    TuiAppearance,
    TuiTable,
    TuiBadge,
    InfiniteScrollModule,
    TuiStatus,
    NgForOf,
    ScrollingModule,
    TuiInputRangeModule,
    TuiSearch,
    TuiSkeleton,
    TuiExpand,
    TuiBlockStatus,
    TuiPreview,
    TuiPreviewTitle,
    TuiPreviewDialogDirective, TuiTextfield, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './tableinventario.component.html',
  providers: [
    tuiValidationErrorsProvider({
      required: 'Required field',
    }),
    TuiConfirmService,
    { provide: 'Pythons', useValue: ['Python One', 'Python Two', 'Python Three'] }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './tableinventario.component.scss'
})
export class TableinventarioComponent implements OnInit, OnDestroy {
  @Input() mode?: string
  @Input() cerrarDialogo!: (valor: Inventario) => void;
  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer?: ElementRef;

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

  // Listas completas del store
  allInventarios: any[] = [];
  allInventariosSearch: any[] = [];

  // Listas que se muestran en la vista (scroll infinito)
  inventariosToShow: any[] = [];
  inventariosSearchToShow: any[] = [];

  loading = false;
  hasMore = true;

  private readonly itemsPerBatch = 20; // Items por cada scroll
  private currentIndex = 0;
  private destroy$ = new Subject<void>();

  protected expanded = false;
  protected open = false;
  protected index = 0;
  protected length = 1;

  protected readonly form = new FormGroup({
    nombre: new FormControl(),
    producto_sku: new FormControl(),
    categoria: new FormControl<any>(null),
    proveedor: new FormControl<any>(null),
    activo: new FormControl(),
    stockRange: new FormControl<[number, number] | null>(null),
    precioCompraRange: new FormControl<[number, number] | null>(null),
    precioVentaRange: new FormControl<[number, number] | null>(null)
  });

  selectCategorias$?: Observable<Categoria[]>;
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

  // Getter para obtener la lista actual según el estado de búsqueda
  get currentInventarios(): any[] {
    return this.isTheSearchWasDone ? this.inventariosSearchToShow : this.inventariosToShow;
  }

  clearSearch() {
    this.store.dispatch(clearSearchInventarios());
    this.isTheSearchWasDone = false;
    // Resetear el scroll infinito a la lista normal
    this.currentIndex = 0;
    this.inventariosSearchToShow = [];
    this.loadInitialBatch();
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

    this.store.dispatch(searchInventarios({ inventarios: this.inventarios, query: searchQuery }))
    this.isTheSearchWasDone = true;
    // Resetear y cargar búsqueda
    this.onSearchPerformed();
  }

  onSearchPerformed() {
    this.currentIndex = 0;
    this.inventariosSearchToShow = [];
    this.loadInitialSearchBatch();
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  onScroll() {
    if (this.loading || !this.hasMore) {
      return;
    }
    this.loadMore();
  }

  loadInitialBatch() {
    this.inventariosToShow = this.allInventarios.slice(0, this.itemsPerBatch);
    this.currentIndex = this.itemsPerBatch;
    this.hasMore = this.currentIndex < this.allInventarios.length;
  }

  loadInitialSearchBatch() {
    this.inventariosSearchToShow = this.allInventariosSearch.slice(0, this.itemsPerBatch);
    this.currentIndex = this.itemsPerBatch;
    this.hasMore = this.currentIndex < this.allInventariosSearch.length;
  }

  loadMore() {
    this.loading = true;

    setTimeout(() => {
      if (this.isTheSearchWasDone) {
        // Cargar más de búsqueda
        const nextBatch = this.allInventariosSearch.slice(
          this.currentIndex,
          this.currentIndex + this.itemsPerBatch
        );

        this.inventariosSearchToShow = [...this.inventariosSearchToShow, ...nextBatch];
        this.currentIndex += this.itemsPerBatch;
        this.hasMore = this.currentIndex < this.allInventariosSearch.length;
      } else {
        // Cargar más de inventarios normales
        const nextBatch = this.allInventarios.slice(
          this.currentIndex,
          this.currentIndex + this.itemsPerBatch
        );

        this.inventariosToShow = [...this.inventariosToShow, ...nextBatch];
        this.currentIndex += this.itemsPerBatch;
        this.hasMore = this.currentIndex < this.allInventarios.length;
      }

      this.loading = false;
    }, 300);
  }

  ngOnInit() {
    // Suscribirse al estado del inventario
    this.store.select(selectInventario)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        // Guardar las listas completas
        this.allInventarios = state.inventarios || [];
        this.allInventariosSearch = state.inventarios_search || [];
        this.inventarios = state.inventarios || [];

        // Si es la primera carga y no hay búsqueda activa, mostrar primeros items
        if (this.inventariosToShow.length === 0 && this.allInventarios.length > 0 && !this.isTheSearchWasDone) {
          this.loadInitialBatch();
        }

        // Si hay búsqueda activa y cambió el resultado, recargar
        if (this.isTheSearchWasDone && state.inventarios_search) {
          this.loadInitialSearchBatch();
        }
      });

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}