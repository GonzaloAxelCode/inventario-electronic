import { TIENDA_ID } from '@/app/constants/tienda-vars';
import { Categoria, CategoriaState } from '@/app/models/categoria.models';
import { Inventario } from '@/app/models/inventario.models';
import { Producto, ProductoState } from '@/app/models/producto.models';
import { TiendaState } from '@/app/models/tienda.models';
import { DialogEditInventarioDetailService } from '@/app/services/dialogs-services/dialog-edit-inventario.service';
import { clearSearchInventarios, createInventario, eliminarInventarioAction, loadInventarios, searchInventarios } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { selectProveedorState } from '@/app/state/selectors/proveedor.selectors';
import { CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { tuiCountFilledControls } from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiDataList, TuiLink, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiChevron, TuiConfirmData, TuiConfirmService, TuiDataListWrapper, TuiFilter, TuiPagination, TuiSegmented, TuiStatus, TuiSwitch, tuiValidationErrorsProvider } from '@taiga-ui/kit';
import { TuiBlockDetails, TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { map, Observable, take } from 'rxjs';
interface QuerySearchInventario {
  nombre?: string;
  categoria?: string;
  sku?: string;
  marca?: string;
  modelo?: string;
  activo?: any;
}
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
    TuiButton,
    TuiChevron,
    TuiDataListWrapper,
    TuiFilter,
    TuiLink,
    TuiSearch,
    TuiSegmented,
    TuiSwitch,
    TuiTextfield, TuiLoader, TuiPagination, TuiBlockStatus,
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

  inventariosState$?: Observable<InventarioState>;
  tiendasState$?: Observable<TiendaState>
  inventarioForm2!: FormGroup;
  productos: Producto[] = [];
  proveedores: any[] = [];
  private readonly dialogs = inject(TuiResponsiveDialogService);

  private readonly dialogEditInventarioService = inject(DialogEditInventarioDetailService);
  allColumns = this.mode === "normal" ? [
    { key: 'id', label: 'ID' },
    { key: 'producto_nombre', label: 'Producto' },
    { key: 'proveedor_nombre', label: 'Proveedor' },
    { key: 'stock_minimo', label: 'Stock Mínimo' },
    { key: 'stock_maximo', label: 'Stock Máximo' },
  ] : [
    { key: 'id', label: 'ID' },
    { key: 'producto_nombre', label: 'Producto' },

  ];
  protected readonly form = new FormGroup({
    nombre: new FormControl(),
    categoria: new FormControl<any>(null),
    activo: new FormControl(),
  });
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  selectCategorias$?: Observable<Categoria[]>;

  compareCategorias = (a: Categoria, b: Categoria) => a && b && a.id === b.id;
  constructor(private fb: FormBuilder, private store: Store<AppState>) {

  }
  protected readonly count = toSignal(
    this.form.valueChanges.pipe(map(() => tuiCountFilledControls(this.form))),
    { initialValue: 0 },
  );
  clearSearch() {
    this.store.dispatch(clearSearchInventarios());
  }
  onSubmitSearch() {

    const searchQuery: Partial<QuerySearchInventario> = {
      nombre: this.form.value.nombre || "",
      categoria: this.form.value?.categoria?.id || 0,
      activo: this.form.value.activo === null ? null : this.form.value.activo === "Activo"
    }
    console.log(searchQuery)
    this.store.dispatch(searchInventarios({ query: searchQuery, tiendaId: TIENDA_ID }))

  }


  ngOnInit() {
    this.inventariosState$ = this.store.select(selectInventario)
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

  protected readonly items = inject<readonly string[]>('Pythons' as any);
  protected readonly filters = ['Python', 'JavaScript', 'TypeScript'];
  protected readonly segments = [null, 'Unread', 'Archived'];


  protected goToPage(index: number): void {
    this.inventariosState$?.pipe(take(1)).subscribe(state => {
      if (state?.search_products_found === '') {
        this.store.dispatch(loadInventarios({ tiendaId: TIENDA_ID, page: index + 1 }));
      } else {
        const searchQuery: Partial<QuerySearchInventario> = {
          nombre: this.form.value.nombre || "",
          categoria: this.form.value?.categoria?.id || 0,
          activo: this.form.value.activo === null ? null : this.form.value.activo === "Activo"
        };
        this.store.dispatch(searchInventarios({ query: searchQuery, tiendaId: TIENDA_ID }));
      }
    });
  }
}
