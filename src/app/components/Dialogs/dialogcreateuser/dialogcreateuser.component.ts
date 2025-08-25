import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiError, TuiIcon, TuiTextfield, } from '@taiga-ui/core';

import { Tienda } from '@/app/models/tienda.models';
import { createUserAction } from '@/app/state/actions/user.actions';
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
    TuiButton, TuiError, TuiPassword, TuiTextareaModule, TuiInputModule, TuiFieldErrorPipe, TuiTextfield, TuiIcon],
  templateUrl: './dialogcreateuser.component.html',
  styleUrl: './dialogcreateuser.component.scss'
})
export class DialogcreateuserComponent {
  userForm: FormGroup;
  protected readonly context = injectContext<TuiDialogContext<boolean, Tienda>>();
  public tienda: Tienda = this.context.data ?? {};
  constructor(private store: Store, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      username: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', Validators.required],
      is_active: [false],

    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
      this.store.dispatch(createUserAction({
        user: { ...newUser },
        tienda_id: this.tienda.id
      }))

    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
