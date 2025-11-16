import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiDialogContext, TuiDropdown, TuiError, TuiLoader, tuiLoaderOptionsProvider, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';

import { TuiBadge, TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';


import { Producto, ProductoState } from '@/app/models/producto.models';
import { TiendaState } from '@/app/models/tienda.models';
import { normalizeSku } from '@/app/services/search-services/producto-search.service';
import { createInventario } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectInventarioState } from '@/app/state/selectors/inventario.selectors';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { selectProveedorState } from '@/app/state/selectors/proveedor.selectors';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectPermissions, selectUsersState } from '@/app/state/selectors/user.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { type TuiStringMatcher } from '@taiga-ui/cdk';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiDataListWrapperComponent, TuiFilterByInputPipe, TuiInputNumber, TuiStringifyContentPipe } from '@taiga-ui/kit';
import { map, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-dialogcreateinventario',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    TuiTextareaModule,
    TuiError,
    TuiButton,
    TuiDataListWrapper,
    TuiDataList,
    TuiTextfield,
    FormsModule, TuiComboBoxModule,
    TuiSelectModule, TuiTabs, TuiDropdown,
    TuiDataListWrapperComponent,
    TuiInputNumber,
    TuiTextfieldControllerModule,
    TuiInputModule, TuiAppearance, TuiTable, TuiNumberFormat, TuiLoader,

    ReactiveFormsModule, TuiBadge,
    TuiComboBoxModule,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiStringifyContentPipe,],
  providers: [
    tuiLoaderOptionsProvider({ size: 'm' })
  ],
  templateUrl: './dialogcreateinventario.component.html',
  styleUrl: './dialogcreateinventario.component.scss'
})
export class DialogcreateinventarioComponent implements OnInit {
  private destroy$ = new Subject<void>();
  private readonly context = inject<TuiDialogContext<any>>(POLYMORPHEUS_CONTEXT);

  productSelected: Producto = {} as Producto
  tiendasState$?: Observable<TiendaState>
  userPermissions$ = this.store.select(selectPermissions);

  inventarioForm2!: FormGroup;
  productos: Producto[] = [];
  tiendas: any[] = [];
  proveedores: any[] = [];
  loadingCreateInventario: boolean = false;
  tiendaUser!: number

  constructor(private fb: FormBuilder, private store: Store<AppState>) {

  }

  ngOnInit() {


    this.store.select(selectProductoState).subscribe((state: ProductoState) => {

      this.productos = state.productos;

    });
    this.store.select(selectProveedorState).subscribe((state: ProveedorState) => {
      // Filtra solo proveedores activos
      this.proveedores = state.proveedores.filter(proveedor => proveedor.activo);
    });

    this.store.select(selectTiendaState).subscribe((state: TiendaState) => {
      this.tiendas = state.tiendas;
    });
    this.store.select(selectInventarioState).subscribe((state: InventarioState) => {
      this.loadingCreateInventario = state.loadingCreate;
    });
    this.inventarioForm2 = this.fb.group({
      producto: [null, Validators.required],
      tienda: [1, Validators.required],
      //proveedor: [null, Validators.required],
      cantidad: [50, [Validators.required, Validators.min(1)]],
      stock_minimo: [1, [Validators.required, Validators.min(1)]],
      stock_maximo: [500, [Validators.required, Validators.max(500)]],
      costo_compra: [8, [Validators.required,]],
      costo_venta: [15, [Validators.required,]],
      descripcion: ['', Validators.required],

    });

    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });



    this.inventarioForm2.get('producto')?.valueChanges.subscribe(producto => {
      console.log("Producto seleccionado", producto);
      if (producto) {
        // Buscar el producto en el array usando el id
        const productoEncontrado = this.productos.find(p => p.id === producto.id);

        if (productoEncontrado) {
          console.log('Producto seleccionado:', productoEncontrado.nombre);
          this.productSelected = productoEncontrado
        } else {
          this.productSelected = { nombre: " " } as Producto
        }
      } else {

        this.productSelected = { nombre: " " } as Producto
      }
    });
  }





  onSubmit(): void {
    if (this.inventarioForm2.valid) {
      const preparedData = {
        ...this.inventarioForm2.value,
        producto: this.inventarioForm2.value.producto.id,
        tienda: this.tiendaUser,
        //proveedor: this.inventarioForm2.value.proveedor.id,
      }
      this.store.dispatch(createInventario({ inventario: preparedData }));
      this.context.completeWith(null); // o algún dato

    }
  }





  protected readonly stringify = ({ sku }: Producto): string => sku;

  protected readonly matcherString = (sku: string, search: string): boolean =>
    sku.split(' ').pop()?.toLowerCase().startsWith(normalizeSku(search).toLowerCase()) ?? false;

  protected readonly matcherProduct: TuiStringMatcher<Producto> = (product, search): boolean =>
    product.sku.toLowerCase().startsWith(normalizeSku(search).toLowerCase());

}
