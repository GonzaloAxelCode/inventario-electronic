import { realizarPrestamo } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiError, TuiIcon, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiInputNumber } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule } from '@taiga-ui/legacy';


import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDataListWrapperComponent } from '@taiga-ui/kit';
import { map } from 'rxjs';

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
export class DialogrealizarprestamoComponent implements OnInit {
  userId!: number
  protected testForm = new FormGroup({

    monto: new FormControl(0, Validators.required),
    descripccion: new FormControl('', Validators.required),

  });
  tiendaUser!: number

  constructor(private store: Store<AppState>) { }
  ngOnInit(): void {
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });

  }
  onSubmit() {

    if (this.testForm.valid) {

      this.store.dispatch(realizarPrestamo({


        monto: this.testForm.value.monto,
        descripcion: this.testForm.value.descripccion,
      }))
    }
  }
}
