import { Categoria } from '@/app/models/categoria.models';
import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { updateCategoriaAction } from '@/app/state/actions/categoria.actions';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiError, } from '@taiga-ui/core';
import urlSlug from 'url-slug';

import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
@Component({
  selector: 'app-dialogupdatecategoria',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton, TuiError, TuiTextareaModule, TuiInputModule, TuiFieldErrorPipe,
  ],
  templateUrl: './dialogupdatecategoria.component.html',
  styleUrl: './dialogupdatecategoria.component.scss'
})
export class DialogupdatecategoriaComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Categoria>>>();
  public categoria: Partial<Categoria> = this.context.data ?? {};
  categoryForm: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      nombre: [this.categoria.nombre, Validators.required],
      descripcion: [this.categoria.descripcion, Validators.required],
      slug: [''],
      siglas_nombre_categoria: [this.categoria.siglas_nombre_categoria, [
        Validators.required,
        Validators.pattern(/^[A-Z]{3}$/)
      ]]
    });
    console.log(this.categoria)
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const newCategory = this.categoryForm.value;
      this.store.dispatch(updateCategoriaAction({
        categoria: {
          ...newCategory,
          id: this.categoria.id,
          slug: urlSlug(newCategory.nombre),
          siglas_nombre_categoria: newCategory.siglas_nombre_categoria.toUpperCase()
        }
      }));
      this.context.completeWith(true);

    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

}
