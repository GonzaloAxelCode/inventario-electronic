import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";

import { Categoria } from '@/app/models/categoria.models';
import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';

import { TuiDialogContext } from '@taiga-ui/core';

import { Inventario } from '@/app/models/inventario.models';
import { TuiBlockDetails } from '@taiga-ui/layout';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { TableinventarioComponent } from "../../Tables/tableinventario/tableinventario.component";

@Component({
  selector: 'app-dialogselectproducts',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiDataList,
    TuiDropdown,
    TuiSelectModule,
    TuiTextareaModule,
    TuiButton,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiInputModule, TuiAppearance, TuiAppearance, TuiTable, TuiBadge, TuiInputModule, TuiBlockDetails, TableinventarioComponent],
  templateUrl: './dialogselectproducts.component.html',

  styleUrl: './dialogselectproducts.component.scss'
})
export class DialogselectproductsComponent implements OnInit {


  inventariosState$?: Observable<InventarioState>;
  inventarioForm2!: FormGroup;

  allColumns = [
    { key: 'id', label: 'ID' },

    { key: 'producto_nombre', label: 'Producto' },



  ];
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  categorias: Categoria[] = [];

  protected readonly context = injectContext<TuiDialogContext<any>>();

  constructor(private fb: FormBuilder, private store: Store<AppState>) {


  }
  ngOnInit() {
    this.inventariosState$ = this.store.select(selectInventario)
    this.store.select(selectCategoriaState).subscribe((state) => {
      this.categorias = state.categorias;

    });
  }
  getCategoriaNombre = (id: number): string => {
    const categoria = this.categorias.find((c) => c.id === id);
    return categoria ? categoria.nombre : '';
  };
  getInventarioValue(inventario: any, key: string): any {
    return inventario[key as keyof any];
  }
  cerrarDialogo(product: Inventario) {
    this.context.completeWith(product);
  }
  closeAndSelectProduct = (inventario: Inventario) => {
    this.context.completeWith(inventario);
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
}
