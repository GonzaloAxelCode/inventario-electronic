import { Producto, ProductoState } from '@/app/models/producto.models';
import { clearSearchProductos, deleteProductoAction, loadProductosAction, searchProductosAction } from '@/app/state/actions/producto.actions';
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
import { map, Observable, take } from 'rxjs';

import { Categoria, CategoriaState } from '@/app/models/categoria.models';
import { DialogUpdateProductService } from '@/app/services/dialogs-services/dialog-updateproduct.service';
import { QuerySearchProduct } from '@/app/services/utils/querys';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
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

  editingId: number | null = null;
  editedProducto: Partial<Producto> = {};
  protected readonly form = new FormGroup({
    nombre: new FormControl(),
    categoria: new FormControl<any>(null),
    activo: new FormControl(),
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
  }


  clearSearch() {
    this.store.dispatch(clearSearchProductos())
    this.store.dispatch(loadProductosAction({}))

  }
  onSubmitSearch() {
    console.log(this.form.value)
    const searchQuery: Partial<QuerySearchProduct> = {
      nombre: this.form.value.nombre || "",
      categoria: this.form.value?.categoria?.id || 0,
      activo: this.form.value.activo === null ? null : this.form.value.activo === "Activo"
    }
    this.store.dispatch(searchProductosAction({ query: searchQuery }))

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

          this.productosState$?.pipe(take(1)).subscribe(state => {

            this.store.dispatch(loadProductosAction({ page: state?.index_page + 1 }));

          });
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



  protected goToPage(index: number): void {
    this.productosState$?.pipe(take(1)).subscribe(state => {
      if (state?.search_products_found === '') {
        this.store.dispatch(loadProductosAction({ page: index + 1 }));
      } else {
        const searchQuery: Partial<QuerySearchProduct> = {
          nombre: this.form.value.nombre || "",
          categoria: this.form.value?.categoria?.id || 0,
          activo: this.form.value.activo === null ? null : this.form.value.activo === "Activo"
        };
        this.store.dispatch(searchProductosAction({ query: searchQuery, page: index + 1 }));
      }
    });
  }

}
