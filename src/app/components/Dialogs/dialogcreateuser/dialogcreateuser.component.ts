import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiError, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';

import { createUserAction, createUserFail, createUserSuccess } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectUser } from '@/app/state/selectors/user.selectors';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiFieldErrorPipe, TuiPassword } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
@Component({
  selector: 'app-dialogcreateuser',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton, TuiError, TuiPassword, TuiTextareaModule, TuiInputModule, TuiFieldErrorPipe, TuiTextfield, TuiIcon, TuiLoader],
  templateUrl: './dialogcreateuser.component.html',
  styleUrl: './dialogcreateuser.component.scss'
})
export class DialogcreateuserComponent {
  userForm: FormGroup;
  private readonly actions$ = inject(Actions); // 🔹 para escuchar acciones

  loadingCreateUser$ = this.store.select(selectUser);
  protected readonly context = injectContext<TuiDialogContext<boolean, number>>();
  public idTienda: number = this.context.data
  constructor(private store: Store<AppState>, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      username: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', Validators.required],
      is_active: [false],

    });

    this.actions$
      .pipe(
        ofType(createUserSuccess, createUserFail), // escucha la acción exitosa
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.context.completeWith(true); // ✅ cerrar el diálogo exitosamente
      });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
      this.store.dispatch(createUserAction({
        user: { ...newUser },
        tienda_id: this.idTienda
      }))

    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
