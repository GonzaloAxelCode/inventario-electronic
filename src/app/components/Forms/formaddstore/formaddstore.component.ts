import { createTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTienda } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/legacy';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formaddstore',
  standalone: true,
  imports: [TuiLoader, CommonModule, ReactiveFormsModule, TuiTextfield, TuiInputModule, TuiAppearance, TuiButton],
  templateUrl: './formaddstore.component.html',
  styleUrl: './formaddstore.component.scss'
})
export class FormaddstoreComponent {
  tiendaForm: FormGroup;
  protected loadingCreateTienda$!: Observable<any>
  constructor(private store: Store<AppState>, private fb: FormBuilder) {

    this.tiendaForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['000000000'],
      ruc: ['1000000001']
    });

    this.loadingCreateTienda$ = this.store.select(selectTienda);

  }



  onSubmit() {
    if (this.tiendaForm.valid) {

      const newTienda = this.tiendaForm.value
      this.store.dispatch(createTiendaAction({
        tienda: newTienda
      }))
      this.tiendaForm.reset();



    }
  }
}
