import { Component, OnInit, OnDestroy } from '@angular/core';

import { Categoria } from '@/app/models/categoria.models';
import { createCategoriaAction, createCategoriaFail, createCategoriaSuccess } from '@/app/state/actions/categoria.actions';
import { AppState } from '@/app/state/app.state';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDialogContext, TuiError, TuiLoader, TuiTextfield, } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiInputChip } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import urlSlug from 'url-slug';
@Component({
  selector: 'app-dialogcreatecategoria',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule, TuiLoader,
    FormsModule,
    TuiButton, TuiError, TuiTextareaModule, TuiTextfield, TuiInputModule, TuiFieldErrorPipe, TuiInputChip
  ],
  templateUrl: './dialogcreatecategoria.component.html',
  styleUrl: './dialogcreatecategoria.component.scss'
})
export class DialogcreatecategoriaComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  private destroy$ = new Subject<void>();
  loadingCreateCategoria$!: Observable<boolean>
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Categoria>>>();
  userPermissions$ = this.store.select(selectPermissions);
  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions) {
    this.categoryForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      slug: [''],
      siglas_nombre_categoria: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z]{4}$/)
      ]],
      caracteristicas_template: this.fb.control<string[]>([], {
        validators: [Validators.required],
      }),

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

    } else {
      this.categoryForm.markAllAsTouched();
    }
  }
  ngOnInit() {
    this.loadingCreateCategoria$ = this.store.select(selectCategoriaState).pipe(
      map((state: CategoriaState) => state.loadingCreateCategoria)
    );
    this.actions$.pipe(
      ofType(createCategoriaSuccess, createCategoriaFail),
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
