import { realizarGasto, realizarGastoFail, realizarGastoSuccess } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { CajaState } from '@/app/state/reducers/caja.reducer';
import { selectCaja } from '@/app/state/selectors/caja.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiDialogContext, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiInputNumber } from '@taiga-ui/kit';
import { TuiTextareaModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Observable, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-dialogregistrargasto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiTextareaModule, TuiFieldErrorPipe, TuiAppearance, TuiButton,
    TuiInputNumber, TuiIcon, TuiLoader,
    TuiTextfield, TuiIcon],
  templateUrl: './dialogregistrargasto.component.html',
  styleUrl: './dialogregistrargasto.component.scss'
})
export class DialogregistrargastoComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<any, any>>();
  protected testForm = new FormGroup({

    monto: new FormControl("", Validators.required),
    descripccion: new FormControl('', Validators.required),

  });

  userId!: number
  cajaState$!: Observable<CajaState>
  id_caja!: number
  private destroy$ = new Subject<void>();
  constructor(private store: Store<AppState>, private actions$: Actions) { }
  ngOnInit(): void {
    this.cajaState$ = this.store.select(selectCaja)
    this.store.select(selectCaja).subscribe((state) => {
      this.id_caja = state.caja.id
    });
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })
    this.actions$.pipe(
      ofType(realizarGastoSuccess, realizarGastoFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.context.completeWith(true);
    });
    //    this.context.completeWith(true);

  }
  onSubmit() {

    if (this.testForm.valid) {

      this.store.dispatch(realizarGasto({
        cajaId: this.id_caja,

        monto: this.testForm.value.monto,
        descripcion: this.testForm.value.descripccion,
      }))
    }
  }
}
