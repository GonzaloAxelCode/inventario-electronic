import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiDialogContext, TuiDropdown, TuiError, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';

import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';


import { Inventario } from '@/app/models/inventario.models';
import { actualizarInventario, actualizarInventarioFail, actualizarInventarioSuccess } from '@/app/state/actions/inventario.actions';
import { loadProductosAction } from '@/app/state/actions/producto.actions';
import { AppState } from '@/app/state/app.state';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiDataListWrapperComponent, TuiInputNumber } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialogeditinventario',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextareaModule,
    TuiError,
    TuiButton,
    TuiDataListWrapper,
    TuiDataList,
    TuiTextfield,
    FormsModule, TuiComboBoxModule,
    TuiSelectModule, TuiTabs, TuiTextfieldControllerModule, TuiDropdown, CommonModule,

    FormsModule,
    ReactiveFormsModule,

    TuiDataListWrapper,
    TuiDataList,
    TuiDataListWrapperComponent,

    TuiSelectModule,

    TuiInputNumber,
    TuiTextareaModule,
    TuiButton,

    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiInputModule, TuiAppearance, TuiAppearance, TuiTable, TuiNumberFormat],
  templateUrl: './dialogeditinventario.component.html',
  styleUrl: './dialogeditinventario.component.scss'
})
export class DialogeditinventarioComponent {



  userPermissions$ = this.store.select(selectPermissions);
  inventarioFormEdit!: FormGroup;

  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Inventario>>>();

  public inventario: Partial<Inventario> = this.context.data ?? {};


  constructor(private fb: FormBuilder, private store: Store<AppState>, private actions$: Actions) {
    this.inventarioFormEdit = this.fb.group({
      cantidad: [this.inventario.cantidad, [Validators.required, Validators.min(1)]],

      costo_compra: [this.inventario.costo_compra, [Validators.required,]],
      costo_venta: [this.inventario.costo_venta, [Validators.required,]],

    });


  }
  private destroy$ = new Subject<void>();

  ngOnInit() {

    this.actions$.pipe(
      ofType(actualizarInventarioSuccess, actualizarInventarioFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.store.dispatch(loadProductosAction());

      this.context.completeWith(true);
    });

  }
  async onSubmit(): Promise<void> {
    if (this.inventarioFormEdit.valid) {

      const preparedData = {
        id: this.inventario.id,
        cantidad: this.inventarioFormEdit.value.cantidad,
        costo_compra: this.inventarioFormEdit.value.costo_compra,
        costo_venta: this.inventarioFormEdit.value.costo_venta,
      }

      this.store.dispatch(actualizarInventario({ newInventario: preparedData }));



    }
  }
}
