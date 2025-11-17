import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiDialogContext, TuiDropdown, TuiError, TuiLoader, tuiLoaderOptionsProvider, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';

import { TuiBadge, TuiChip, TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';


import { Producto } from '@/app/models/producto.models';
import { TiendaState } from '@/app/models/tienda.models';
import { normalizeSku } from '@/app/services/search-services/producto-search.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { createInventario, createInventarioFail, createInventarioSuccess } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { selectInventarioState } from '@/app/state/selectors/inventario.selectors';
import { selectPermissions, selectUsersState } from '@/app/state/selectors/user.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { type TuiStringMatcher } from '@taiga-ui/cdk';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiDataListWrapperComponent, TuiFilterByInputPipe, TuiInputNumber, TuiStringifyContentPipe } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
import { map, Observable, Subject, takeUntil } from 'rxjs';
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
    TuiComboBoxModule, TuiChip,
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
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Producto>>>();
  public producto: Partial<Producto> = this.context.data ?? {};
  URL_BASE = URL_BASE + "/"
  productSelected: Producto = {} as Producto
  tiendasState$?: Observable<TiendaState>
  userPermissions$ = this.store.select(selectPermissions);

  inventarioForm2!: FormGroup;
  productos: Producto[] = [];
  tiendas: any[] = [];
  proveedores: any[] = [];
  loadingCreateInventario: boolean = false;
  tiendaUser!: number

  constructor(private fb: FormBuilder, private store: Store<AppState>, private actions$: Actions) {

  }

  ngOnInit() {


    this.store.select(selectInventarioState).subscribe((state: InventarioState) => {
      this.loadingCreateInventario = state.loadingCreate;
    });
    this.inventarioForm2 = this.fb.group({
      producto: [this.producto.id, Validators.required],

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



    this.actions$.pipe(
      ofType(createInventarioSuccess, createInventarioFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.context.completeWith(true);
    });
  }




  protected titles = ["Producto Sin Imagen"]
  protected content = ['https://st2.depositphotos.com/1561359/12101/v/950/depositphotos_121012076-stock-illustration-blank-photo-icon.jpg']
  onSetImageProduct(producto: Producto) {

    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";

    const imagenFinal = producto?.imagen
      ? URL_BASE + producto.imagen
      : placeholder;

    this.titles = [producto.nombre || "Producto Sin Nombre"];
    this.content = [imagenFinal];
  }
  onSubmit(): void {
    if (this.inventarioForm2.valid) {
      const preparedData = {
        ...this.inventarioForm2.value,
        producto: this.producto.id,
        tienda: this.tiendaUser,

        //proveedor: this.inventarioForm2.value.proveedor.id,
      }
      console.log(preparedData)
      this.store.dispatch(createInventario({ inventario: preparedData }));


    }
  }





  protected readonly stringify = ({ sku }: Producto): string => sku;

  protected readonly matcherString = (sku: string, search: string): boolean =>
    sku.split(' ').pop()?.toLowerCase().startsWith(normalizeSku(search).toLowerCase()) ?? false;

  protected readonly matcherProduct: TuiStringMatcher<Producto> = (product, search): boolean =>
    product.sku.toLowerCase().startsWith(normalizeSku(search).toLowerCase());

}
