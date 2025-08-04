import { realizarPrestamo } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiError, TuiIcon, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiInputNumber } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule } from '@taiga-ui/legacy';


import { TIENDA_ID } from '@/app/constants/tienda-vars';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDataListWrapperComponent } from '@taiga-ui/kit';

@Component({
  selector: 'app-dialogrealizarprestamo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiTextareaModule, TuiFieldErrorPipe, TuiAppearance, TuiButton, TuiTextfieldControllerModule,
    TuiInputNumber, FormsModule, TuiInputModule, TuiInputNumber,
    TuiTextfield, TuiIcon, CommonModule,
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
  templateUrl: './dialogrealizarprestamo.component.html',
  styleUrl: './dialogrealizarprestamo.component.scss'
})
export class DialogrealizarprestamoComponent {
  protected testForm = new FormGroup({

    monto: new FormControl(0, Validators.required),
    descripccion: new FormControl('', Validators.required),

  });
  constructor(private store: Store<AppState>) { }

  onSubmit() {

    if (this.testForm.valid) {
      console.log(this.testForm.value)
      this.store.dispatch(realizarPrestamo({
        tiendaId: TIENDA_ID,
        userId: 5,
        monto: this.testForm.value.monto,
        descripcion: this.testForm.value.descripccion,
      }))
    }
  }
}
