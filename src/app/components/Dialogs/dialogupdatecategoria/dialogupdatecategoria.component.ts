import { Categoria } from '@/app/models/categoria.models';
import { Component, inject } from '@angular/core';
import { TuiButton, TuiDialogContext, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { updateCategoriaAction, updateCategoriaSuccess } from '@/app/state/actions/categoria.actions';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';

import { AppState } from '@/app/state/app.state';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import urlSlug from 'url-slug';

@Component({
  selector: 'app-dialogupdatecategoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
     TuiButton,
    TuiTextareaModule,
    TuiTextfield,
    TuiInputModule,
    TuiFieldErrorPipe,
    TuiLoader,
    TuiIcon,
  ],
  templateUrl: './dialogupdatecategoria.component.html',
  styleUrl: './dialogupdatecategoria.component.scss'
})
export class DialogupdatecategoriaComponent {
  userPermissions$ = this.store.select(selectPermissions);
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Categoria>>>();
  public categoria: Partial<Categoria> = this.context.data ?? {};
  categoryForm: FormGroup;
  categoriaError$ = this.store.select(selectCategoria).pipe(
    map((state: CategoriaState) => state.errors?.error || {})
  );
  private readonly actions$ = inject(Actions);
  loadingUpdateCategoria$ = this.store.select(selectCategoria);

  constructor(private store: Store<AppState>, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      nombre: [this.categoria.nombre, Validators.required],
      descripcion: [this.categoria.descripcion, Validators.required],
      slug: [''],
      caracteristicas_template: this.fb.array(
        (this.categoria.caracteristicas_template || []).map(c => this.fb.control(c, Validators.required))
      ),
    });

    this.actions$
      .pipe(
        ofType(updateCategoriaSuccess),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.context.completeWith(true);
      });
  }

  get caracteristicasArray(): FormArray {
    return this.categoryForm.get('caracteristicas_template') as FormArray;
  }

  addCaracteristica(): void {
    this.caracteristicasArray.push(this.fb.control('', Validators.required));
  }

  removeCaracteristica(index: number): void {
    this.caracteristicasArray.removeAt(index);
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const newCategory = this.categoryForm.getRawValue();
      const { caracteristicas_template, ...categoriaData } = newCategory;
      this.store.dispatch(updateCategoriaAction({
        categoria: {
          ...categoriaData,
          id: this.categoria.id,
          caracteristicas_template,
          slug: urlSlug(categoriaData.nombre),
        }
      }));
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }
}
