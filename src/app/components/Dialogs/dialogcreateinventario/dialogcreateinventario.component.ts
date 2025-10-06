import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiDropdown, TuiError, TuiLoader, tuiLoaderOptionsProvider, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';

import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';


import { Producto, ProductoState } from '@/app/models/producto.models';
import { TiendaState } from '@/app/models/tienda.models';
import { createInventario } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectInventarioState } from '@/app/state/selectors/inventario.selectors';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { selectProveedorState } from '@/app/state/selectors/proveedor.selectors';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiDataListWrapperComponent, TuiInputNumber } from '@taiga-ui/kit';
import { map, Observable } from 'rxjs';


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
    TuiInputModule, TuiAppearance, TuiTable, TuiNumberFormat, TuiLoader],
  providers: [
    tuiLoaderOptionsProvider({ size: 'm' })
  ],
  templateUrl: './dialogcreateinventario.component.html',
  styleUrl: './dialogcreateinventario.component.scss'
})
export class DialogcreateinventarioComponent implements OnInit {

  tiendasState$?: Observable<TiendaState>

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
      proveedor: [null, Validators.required],

      cantidad: [1, [Validators.required, Validators.min(1)]],
      stock_minimo: [1, [Validators.required, Validators.min(0)]],
      stock_maximo: [100, [Validators.required, Validators.min(1)]],
      costo_compra: [1, [Validators.required,]],
      costo_venta: [1, [Validators.required,]],
      descripcion: ['', Validators.required]
    });
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
  }
  onSubmit(): void {
    if (this.inventarioForm2.valid) {

      const preparedData = {
        ...this.inventarioForm2.value,
        producto: this.inventarioForm2.value.producto.id,
        tienda: this.tiendaUser,
        proveedor: this.inventarioForm2.value.proveedor.id,
      }

      this.store.dispatch(createInventario({ inventario: preparedData }));
    } else {

    }
  }


}
