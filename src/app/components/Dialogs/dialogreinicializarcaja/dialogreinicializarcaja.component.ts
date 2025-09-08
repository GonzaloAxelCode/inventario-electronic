import { reinicializarCaja, reinicializarCajaFail, reinicializarCajaSuccess } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { CajaState } from '@/app/state/reducers/caja.reducer';
import { selectCaja } from '@/app/state/selectors/caja.selectors';
import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiDialogContext, TuiLoader, TuiNotification, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { TuiInputModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { map, Observable, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-dialogreinicializarcaja',
  standalone: true,
  imports: [CommonModule, TuiLoader, TuiAppearance, TuiButton, TuiTextfield, TuiAppearance, TuiButton, FormsModule, ReactiveFormsModule, TuiNotification, TuiInputNumber, TuiInputModule],
  templateUrl: './dialogreinicializarcaja.component.html',
  styleUrl: './dialogreinicializarcaja.component.scss'
})
export class DialogreinicializarcajaComponent {

  protected readonly form = new FormGroup({
    saldo_inicial: new FormControl("", Validators.required),
  });
  protected readonly context = injectContext<TuiDialogContext<any, any>>();
  constructor(private store: Store<AppState>, private actions$: Actions) { }
  id_caja!: number
  userId!: number
  tiendaUser!: number
  cajaState$!: Observable<CajaState>
  private destroy$ = new Subject<void>();
  ngOnInit(): void {
    this.store.select(selectCaja).subscribe((state) => {
      this.id_caja = state.caja.id
    });
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });


    this.cajaState$ = this.store.select(selectCaja)
    this.actions$.pipe(
      ofType(reinicializarCajaSuccess, reinicializarCajaFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.context.completeWith(true);
    });
  }
  onSubmit() {
    this.store.dispatch(reinicializarCaja({

      cajaId: this.id_caja,

      saldoInicial: this.form.value.saldo_inicial,
    }))
  }

}
