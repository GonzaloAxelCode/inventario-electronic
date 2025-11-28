import { Categoria } from '@/app/models/categoria.models';
import { Component, inject } from '@angular/core';
import { TuiDialogContext, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { updateCategoriaAction, updateCategoriaFail, updateCategoriaSuccess } from '@/app/state/actions/categoria.actions';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiError, } from '@taiga-ui/core';
import urlSlug from 'url-slug';

import { AppState } from '@/app/state/app.state';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { TuiFieldErrorPipe, TuiInputChip } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
@Component({
  selector: 'app-dialogupdatecategoria',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton, TuiError, TuiTextareaModule, TuiInputChip, TuiTextfield, TuiInputModule, TuiFieldErrorPipe, TuiLoader],
  templateUrl: './dialogupdatecategoria.component.html',
  styleUrl: './dialogupdatecategoria.component.scss'
})
export class DialogupdatecategoriaComponent {
  userPermissions$ = this.store.select(selectPermissions);
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Categoria>>>();
  public categoria: Partial<Categoria> = this.context.data ?? {};
  categoryForm: FormGroup;
  private readonly actions$ = inject(Actions); // 🔹 para escuchar acciones
  loadingUpdateCategoria$ = this.store.select(selectCategoria);
  constructor(private store: Store<AppState>, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      nombre: [this.categoria.nombre, Validators.required],
      descripcion: [this.categoria.descripcion, Validators.required],
      slug: [''],
      siglas_nombre_categoria: [this.categoria.siglas_nombre_categoria, [
        Validators.required,
        Validators.pattern(/^[A-Z]{4}$/)
      ]],
      caracteristicas_template: this.fb.control<string[]>(this.categoria.caracteristicas_template || [], {
        validators: [Validators.required],
      }),
    });

    this.actions$
      .pipe(
        ofType(updateCategoriaSuccess, updateCategoriaFail), // escucha la acción exitosa
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.context.completeWith(true); // ✅ cerrar el diálogo exitosamente
      });
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


    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

}
