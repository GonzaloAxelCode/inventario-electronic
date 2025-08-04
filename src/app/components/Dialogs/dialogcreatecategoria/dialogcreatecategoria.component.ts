import { Component } from '@angular/core';

import { Categoria } from '@/app/models/categoria.models';
import { createCategoriaAction } from '@/app/state/actions/categoria.actions';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDialogContext, TuiError, } from '@taiga-ui/core';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import urlSlug from 'url-slug';
@Component({
  selector: 'app-dialogcreatecategoria',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton, TuiError, TuiTextareaModule, TuiInputModule, TuiFieldErrorPipe,
  ],
  templateUrl: './dialogcreatecategoria.component.html',
  styleUrl: './dialogcreatecategoria.component.scss'
})
export class DialogcreatecategoriaComponent {
  categoryForm: FormGroup;
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Categoria>>>();
  constructor(private store: Store, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      slug: [''],
      siglas_nombre_categoria: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z]{3}$/)
      ]]
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const newCategory = this.categoryForm.value;
      this.store.dispatch(createCategoriaAction({
        categoria: {
          ...newCategory,
          slug: urlSlug(newCategory.nombre),
          siglas_nombre_categoria: newCategory.siglas_nombre_categoria.toUpperCase()
        }
      }));
      this.context.completeWith(true)
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }
}
