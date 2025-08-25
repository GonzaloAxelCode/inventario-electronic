import { createTiendaAction } from '@/app/state/actions/tienda.actions';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/legacy';
@Component({
  selector: 'app-formaddstore',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiTextfield, TuiInputModule, TuiAppearance, TuiButton],
  templateUrl: './formaddstore.component.html',
  styleUrl: './formaddstore.component.scss'
})
export class FormaddstoreComponent {
  tiendaForm: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {

    this.tiendaForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: [''],
      ruc: ['', Validators.required]
    });
  }



  onSubmit() {
    if (this.tiendaForm.valid) {

      const newTienda = this.tiendaForm.value
      this.store.dispatch(createTiendaAction({
        tienda: newTienda
      }))
    }
  }
}
