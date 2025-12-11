import { Producto, ProductoState } from '@/app/models/producto.models';
import { clearSearchProductos, deleteProductoAction, loadProductosAction, searchProductosAction } from '@/app/state/actions/producto.actions';
import { AppState } from '@/app/state/app.state';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { CommonModule, NgForOf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDialogService, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiChip, TuiConfirmService, TuiDataListWrapper, TuiPagination, TuiPreview, TuiPreviewDialogDirective, TuiPreviewTitle, TuiRadio } from '@taiga-ui/kit';
import { map, Observable, take } from 'rxjs';

import { Categoria } from '@/app/models/categoria.models';
import { DialogCreateInventarioService } from '@/app/services/dialogs-services/dialog-create-inventario.service';
import { DialogEditInventarioDetailService } from '@/app/services/dialogs-services/dialog-edit-inventario.service';
import { DialogUpdateProductService } from '@/app/services/dialogs-services/dialog-updateproduct.service';
import { capitalize } from '@/app/services/utils/capitalize';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { PAGE_SIZE_PRODUCTS } from '@/app/services/utils/pages-sizes';
import { QuerySearchProduct } from '@/app/services/utils/querys';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { generarBarcode } from '@/app/utils/barcode';
import { toSignal } from '@angular/core/rxjs-interop';
import { tuiCountFilledControls } from '@taiga-ui/cdk';
import type { TuiConfirmData } from '@taiga-ui/kit';
import { TuiBlockDetails, TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-tableproduct',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TuiPreview, TuiPreviewTitle, TuiPreviewDialogDirective,
    TuiRadio, TuiChip,
    TuiButton,
    TuiTable,
    TuiBlockStatus,

    TuiButton, TuiBlockDetails,
    TuiPagination,
    TuiTextfield, TuiSearch, FormsModule, TuiDataListWrapper, NgForOf,
    TuiSelectModule, TuiTextfieldControllerModule,
    TuiLoader,
    TuiAppearance
  ],
  templateUrl: './tableproduct.component.html',
  styleUrl: './tableproduct.component.scss',
  providers: [TuiConfirmService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableproductComponent implements OnInit, AfterViewInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;
  private buffer: string = '';
  protected open = false;
  protected index = 0;
  protected length = 1;

  @ViewChildren('barcodeImg') barcodeImgs!: QueryList<ElementRef<HTMLImageElement>>;

  protected titles = ["Producto Sin Imagen"]
  protected content = ['https://st2.depositphotos.com/1561359/12101/v/950/depositphotos_121012076-stock-illustration-blank-photo-icon.jpg']
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
  ngAfterViewInit() {
    this.barcodeImgs.forEach((img, index) => {
      const codigo = this.productos[index].sku;
      generarBarcode(img.nativeElement, codigo);
    });
  }
  imprimir() {
    window.print();
  }

  compareCategorias = (a: Categoria, b: Categoria) => a && b && a.id === b.id;

  selectCategorias$?: Observable<Categoria[]>;

  mostrarAdvertencia(categoria: any) {
    return categoria?.includes("(Delete)")
      ? "⚠️ Urgente: Asignar una nueva categoría"
      : "";
  }

  stringify = (item: { id: number; nombre: string } | null) => item ? item.nombre : '';

  protected readonly states = [null, 'Activo', 'Inactivo'];

  protected readonly count = toSignal(
    this.form.valueChanges.pipe(map(() => tuiCountFilledControls(this.form))),
    { initialValue: 0 },
  );
  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },

    { key: 'precio', label: 'Precio' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'sku', label: 'SKU' },

    { key: 'fechaCreacion', label: 'Fecha Creación' },
    { key: 'inventario', label: 'STOCK' },
    { key: 'inventario', label: 'VENTA' },
    { key: 'activo', label: 'Activo' },
  ];
  URL_BASE = URL_BASE
  isTheSearchWasDone: boolean = false
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  constructor(private store: Store<AppState>, @Inject(TuiDialogService) private readonly dialogs2: TuiDialogService) { }
  onSetImageProduct(producto: Producto) {

    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";

    const imagenFinal = producto?.imagen
      ? URL_BASE + producto.imagen
      : placeholder;

    this.titles = [producto.nombre || "Producto Sin Nombre"];
    this.content = [imagenFinal];
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
  ngOnInit(): void {

    this.productosState$ = this.store.select(selectProductoState);
    this.selectCategorias$ = this.store.select(selectCategoria).pipe(
      map((state: CategoriaState) => state.categorias)
    );
    this.store.select(selectProductoState).subscribe((state) => {
      this.productos = state.productos
      console.log(state.productos)
    })


  }
  capitalize = capitalize
  private readonly dialogEditInventarioService = inject(DialogEditInventarioDetailService);
  protected showDialogEditInventario(currentInventario: any): void {
    this.dialogEditInventarioService.open(currentInventario).subscribe((result: any) => {
    });
  }
  clearSearch() {
    this.store.dispatch(clearSearchProductos())
    this.store.dispatch(loadProductosAction({ page: 1, page_size: PAGE_SIZE_PRODUCTS }))
  }

  onSubmitSearch() {

    const searchQuery: Partial<QuerySearchProduct> = {
      nombre: (this.form.value.nombre || "").trim(),
      categoria: this.form.value?.categoria?.id || 0,
      sku: (this.form.value.sku || "").trim(),
    }
    this.store.dispatch(searchProductosAction({ query: searchQuery, page_size: PAGE_SIZE_PRODUCTS, page: 1 }))

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

  private readonly dialogService2 = inject(DialogCreateInventarioService);
  protected crearInventario(producto: Producto): void {
    this.dialogService2.open(producto).subscribe((result: any) => {

    });
  }



  protected goToPage(index: number): void {

    this.productosState$?.pipe(take(1)).subscribe(state => {
      if (state?.search_products_found === '') {
        this.store.dispatch(loadProductosAction({
          page: index + 1,
          page_size: PAGE_SIZE_PRODUCTS
        }))
      } else {
        const searchQuery: Partial<QuerySearchProduct> = {
          nombre: (this.form.value.nombre || "").trim(),
          categoria: this.form.value?.categoria?.id || 0,
          sku: (this.form.value.sku || "").trim(),
        };
        this.store.dispatch(searchProductosAction({ query: searchQuery, page: index + 1, page_size: PAGE_SIZE_PRODUCTS }));
      }


    });
  }


}
