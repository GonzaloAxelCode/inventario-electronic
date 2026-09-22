import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiError, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';

import { createUserAction, createUserFail, createUserSuccess } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectUser } from '@/app/state/selectors/user.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { getPropietarioId, findTiendaById, getLimitePersonal, getUsoPersonal } from '@/app/models/tienda.models';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiFieldErrorPipe, TuiPassword } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { map } from 'rxjs';
@Component({
  selector: 'app-dialogcreateuser',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TuiButton, TuiError, TuiPassword, TuiTextareaModule, TuiInputModule, TuiFieldErrorPipe, TuiTextfield, TuiIcon, TuiLoader],
  templateUrl: './dialogcreateuser.component.html',
  styleUrl: './dialogcreateuser.component.scss'
})
export class DialogcreateuserComponent {
  userForm: FormGroup;
  private readonly actions$ = inject(Actions); // 🔹 para escuchar acciones

  loadingCreateUser$ = this.store.select(selectUser);
  protected readonly context = injectContext<TuiDialogContext<boolean, number>>();
  public idTienda: number = this.context.data
  isSuperUser = false;
  tiendaSinPropietario = false;
  limitePersonalAlcanzado = false;
  limitePersonalInfo = { usados: 0, limite: 0 };
  constructor(private store: Store<AppState>, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      username: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', Validators.required],
      is_active: [false],
      is_propietario: [false],

    });

    // Toggle visible solo para superusuario y si la tienda aún no tiene propietario
    this.store.select(selectCurrenttUser).pipe(takeUntilDestroyed()).subscribe(u => {
      this.isSuperUser = !!u?.is_superuser;
    });
    this.store.select(selectTiendaState).pipe(
      map(s => findTiendaById(s.tiendas, this.idTienda)),
      takeUntilDestroyed()
    ).subscribe(t => {
      this.tiendaSinPropietario = !!t && getPropietarioId(t) == null;
      // Límite del plan: si se alcanzó, no se puede crear más personal
      const limite = getLimitePersonal(t);
      if (limite != null && limite < 999999) {
        const usados = getUsoPersonal(t, 0);
        this.limitePersonalInfo = { usados, limite };
        this.limitePersonalAlcanzado = usados >= limite;
      } else {
        this.limitePersonalAlcanzado = false;
      }
    });

    this.actions$
      .pipe(
        ofType(createUserSuccess, createUserFail), // escucha la acción exitosa
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.context.completeWith(true); // ✅ cerrar el diálogo exitosamente
      });
  }

  get mostrarTogglePropietario(): boolean {
    return this.isSuperUser && this.tiendaSinPropietario;
  }

  onSubmit() {
    if (this.limitePersonalAlcanzado) return;
    if (this.userForm.valid) {
      const raw = this.userForm.value;
      const newUser = {
        ...raw,
        // Solo se envía true si el toggle estuvo visible y activado
        is_propietario: this.mostrarTogglePropietario ? !!raw.is_propietario : false,
      };
      this.store.dispatch(createUserAction({
        user: { ...newUser },
        tienda_id: this.idTienda
      }))

    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.context.completeWith(false);
  }
}
