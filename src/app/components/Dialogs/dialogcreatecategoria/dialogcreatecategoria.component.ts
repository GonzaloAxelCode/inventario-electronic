import { Component, OnInit, OnDestroy } from '@angular/core';

import { Categoria } from '@/app/models/categoria.models';
import { createCategoriaAction, createCategoriaSuccess } from '@/app/state/actions/categoria.actions';
import { AppState } from '@/app/state/app.state';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDialogContext, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import urlSlug from 'url-slug';

@Component({
  selector: 'app-dialogcreatecategoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiLoader,
    FormsModule,
    TuiButton,
    TuiTextareaModule,
    TuiTextfield,
    TuiInputModule,
    TuiFieldErrorPipe,
    TuiIcon,
  ],
  templateUrl: './dialogcreatecategoria.component.html',
  styleUrl: './dialogcreatecategoria.component.scss',
})
export class DialogcreatecategoriaComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  categoriaError$!: Observable<any>;
  private destroy$ = new Subject<void>();
  loadingCreateCategoria$!: Observable<boolean>;
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Categoria>>>();
  userPermissions$ = this.store.select(selectPermissions);

  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions) {
    this.categoryForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      slug: [''],
      caracteristicas_template: this.fb.array([]),
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
      this.store.dispatch(createCategoriaAction({
        categoria: {
          ...categoriaData,
          caracteristicas_template,
          slug: urlSlug(categoriaData.nombre),
        }
      }));

    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.loadingCreateCategoria$ = this.store.select(selectCategoriaState).pipe(
      map((state:CategoriaState) => state.loadingCreateCategoria)
    );
    this.categoriaError$ = this.store.select(selectCategoriaState).pipe(
      map((state: CategoriaState) => state.errors?.error || {})
    );
    this.actions$.pipe(
      ofType(createCategoriaSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.context.completeWith(true);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
