import { Producto, ProductoState } from '@/app/models/producto.models';
import { clearSearchProductos, deleteProductoAction, searchProductosAction } from '@/app/state/actions/producto.actions';
import { AppState } from '@/app/state/app.state';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiChevron, TuiConfirmService, TuiDataListWrapper, TuiFilter, TuiPagination, TuiRadio, TuiSegmented, TuiSkeleton, TuiSwitch } from '@taiga-ui/kit';
import { map, Observable } from 'rxjs';

import { Categoria } from '@/app/models/categoria.models';
import { DialogUpdateProductService } from '@/app/services/dialogs-services/dialog-updateproduct.service';
import { QuerySearchProduct } from '@/app/services/utils/querys';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { tuiCountFilledControls } from '@taiga-ui/cdk';
import type { TuiConfirmData } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge, TuiSearch } from '@taiga-ui/layout';
import { TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-tableproduct',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TuiBadge,
    TuiRadio,
    FormsModule,
    TuiTable,
    TuiBlockStatus, TuiButton, TuiSkeleton, TuiCardLarge, TuiChevron,
    TuiDataListWrapper,
    TuiFilter,
    TuiSegmented,
    TuiSwitch, TuiTextfield, TuiSearch, FormsModule, TuiDataListWrapper, NgForOf, TuiLoader,
    TuiSelectModule, TuiTextfieldControllerModule, TuiPagination
  ],
  templateUrl: './tableproduct.component.html',
  styleUrl: './tableproduct.component.scss',
  providers: [TuiConfirmService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableproductComponent implements OnInit {
  productosState$?: Observable<ProductoState>;
  userPermissions$ = this.store.select(selectPermissions);
  productos: Producto[] = []
  editingId: number | null = null;
  editedProducto: Partial<Producto> = {};
  protected readonly form = new FormGroup({
    nombre: new FormControl(),
    categoria: new FormControl<any>(null),
    activo: new FormControl(),

    sku: new FormControl(),
  });
  compareCategorias = (a: Categoria, b: Categoria) => a && b && a.id === b.id;

  selectCategorias$?: Observable<Categoria[]>;


  stringify = (item: { id: number; nombre: string } | null) => item ? item.nombre : '';

  protected readonly states = [null, 'Activo', 'Inactivo'];

  protected readonly count = toSignal(
    this.form.valueChanges.pipe(map(() => tuiCountFilledControls(this.form))),
    { initialValue: 0 },
  );
  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'precio', label: 'Precio' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'sku', label: 'SKU' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'fechaCreacion', label: 'Fecha Creación' },
    { key: 'activo', label: 'Activo' },
  ];
  isTheSearchWasDone: boolean = false
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {

    this.productosState$ = this.store.select(selectProductoState);
    this.selectCategorias$ = this.store.select(selectCategoria).pipe(
      map((state: CategoriaState) => state.categorias)
    );
    this.store.select(selectProductoState).subscribe((state) => {
      this.productos = state.productos
    })

    this.form.valueChanges.subscribe(values => {
      this.onSubmitSearch()
    });
  }


  clearSearch() {
    this.store.dispatch(clearSearchProductos())
    this.isTheSearchWasDone = false

  }
  onSubmitSearch() {

    const searchQuery: Partial<QuerySearchProduct> = {
      nombre: (this.form.value.nombre || "").trim(),
      categoria: this.form.value?.categoria?.id || 0,

      sku: (this.form.value.sku || "").trim(),
    }
    this.store.dispatch(searchProductosAction({ products: this.productos, query: searchQuery }))
    console.log(searchQuery)
    this.isTheSearchWasDone = true
  }

  protected onDeleteProducto(id: any): void {
    const data: TuiConfirmData = {
      content: '¿Estás seguro de que deseas eliminar este producto?',
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
          this.store.dispatch(deleteProductoAction({ id }));
          this.alerts.open('Producto eliminado exitosamente.').subscribe();
        } else {

          this.alerts.open('Eliminación cancelada.').subscribe();
        }
      });
  }
  private readonly dialogService = inject(DialogUpdateProductService);
  protected showDialogUpdate(producto: Producto): void {
    this.dialogService.open(producto).subscribe((result: any) => {

    });
  }




}
