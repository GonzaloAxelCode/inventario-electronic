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
  selectedLogo: File | null = null;
  logoPreview: string | null = null;

  constructor(private store: Store<AppState>, private fb: FormBuilder) {


    this.tiendaForm = this.fb.group({
      nombre: ['', Validators.required],
      razon_social: [''],        // opcional
      ruc: ['',],       // valor por defecto
      direccion: [''],           // opcional
      telefono: [''],   // valor por defecto
      email: [''],               // opcional
      sol_user: [''],            // opcional
      sol_password: [''],        // opcional
      activo: [true],            // por defecto activo
    });


    this.loadingCreateTienda$ = this.store.select(selectTienda);

  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      console.log('Archivo seleccionado:', this.selectedLogo.name);

      // Creamos preview
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogo);
    } else {
      this.selectedLogo = null;
      this.logoPreview = null;
    }
  }


  onSubmit() {
    if (this.tiendaForm.valid) {
      // Creamos FormData
      const formData = new FormData();

      // Agregamos todos los campos del formulario
      Object.entries(this.tiendaForm.value).forEach(([key, value]) => {
        formData.append(key, value as any); // Angular guarda todo como string por defecto
      });

      // Agregamos el logo si existe
      if (this.selectedLogo) {
        formData.append('logo_img', this.selectedLogo);
      }

      // Despachamos la acción con FormData
      this.store.dispatch(createTiendaAction({ tienda: formData }));

      // Limpiamos el formulario
      this.tiendaForm.reset({
        nombre: [''],
        razon_social: [''],        // opcional
        ruc: [''],       // valor por defecto
        direccion: [''],           // opcional
        telefono: [''],   // valor por defecto
        email: [''],               // opcional
        sol_user: [''],            // opcional
        sol_password: [''],        // opcional
        activo: [true],
      });
      this.selectedLogo = null;
    }
  }

}
