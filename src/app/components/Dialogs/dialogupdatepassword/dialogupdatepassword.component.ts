import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiError, TuiIcon, TuiTextfield, } from '@taiga-ui/core';

import { TuiFieldErrorPipe, TuiPassword } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
@Component({
  selector: 'app-dialogupdatepassword',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton, TuiError, TuiPassword, TuiTextareaModule, TuiInputModule, TuiFieldErrorPipe, TuiTextfield, TuiIcon],
  templateUrl: './dialogupdatepassword.component.html',
  styleUrl: './dialogupdatepassword.component.scss'
})
export class DialogupdatepasswordComponent {
  passwordsForm: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.passwordsForm = this.fb.group({


      password: ['', Validators.required],
      re_password: ['', Validators.required],


    });
  }

  onSubmit() {
    if (this.passwordsForm.valid) {
      const newPassowrds = this.passwordsForm.value;

    } else {
      this.passwordsForm.markAllAsTouched();
    }
  }
}
