import { createProveedorAction } from '@/app/state/actions/proveedor.actions';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-formproveedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiInputModule,
    TuiButton],
  templateUrl: './formproveedor.component.html',
  styleUrl: './formproveedor.component.scss'
})
export class FormproveedorComponent {
  proveedorForm: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.proveedorForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      tipo_producto: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      const newProveedor = this.proveedorForm.value;
      this.store.dispatch(createProveedorAction({ proveedor: newProveedor }));
    }
  }
}
