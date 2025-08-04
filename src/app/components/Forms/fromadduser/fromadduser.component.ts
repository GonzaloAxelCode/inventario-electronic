

import { createUserAction } from '@/app/state/actions/user.actions';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-fromadduser',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule],

  templateUrl: './fromadduser.component.html',
  styleUrl: './fromadduser.component.scss'
})
export class FromadduserComponent {
  userForm: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],

    });
  }

  onSubmit() {
    if (this.userForm.valid) {

      const newUser = this.userForm.value;
      this.store.dispatch(createUserAction({
        user: {
          ...newUser,
          password: "stbmpTejnulcNAA"
        }
      }));
    }
  }
}
