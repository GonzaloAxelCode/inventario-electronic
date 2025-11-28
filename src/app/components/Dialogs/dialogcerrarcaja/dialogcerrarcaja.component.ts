import { Caja } from '@/app/models/caja.models';
import { cerrarCaja, cerrarCajaFail, cerrarCajaSuccess } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { CajaState } from '@/app/state/reducers/caja.reducer';
import { selectCaja } from '@/app/state/selectors/caja.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { AsyncPipe, CommonModule, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDialogContext, TuiFormatNumberPipe, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { TuiCell } from '@taiga-ui/layout';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Observable, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-dialogcerrarcaja',
  standalone: true,
  imports: [CommonModule, TuiLoader, TuiAppearance, TuiButton, AsyncPipe, NgForOf, TuiFormatNumberPipe, TuiTable, TuiTitle, TuiCell],
  templateUrl: './dialogcerrarcaja.component.html',
  styleUrl: './dialogcerrarcaja.component.scss'
})
export class DialogcerrarcajaComponent implements OnInit {
  caja!: Caja
  userId!: number
  protected readonly context = injectContext<TuiDialogContext<any, any>>();
  cajaState$!: Observable<CajaState>
  private destroy$ = new Subject<void>();
  constructor(private store: Store<AppState>, private actions$: Actions) {


  }
  ngOnInit(): void {
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })
    this.store.select(selectCaja).subscribe((state) => {
      this.caja = state.caja
    });


    this.cajaState$ = this.store.select(selectCaja)
    this.actions$.pipe(
      ofType(cerrarCajaSuccess, cerrarCajaFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.context.completeWith(true);
    });
  }
  cerrarCaja() {
    this.store.dispatch(cerrarCaja({
      cajaId: this.caja.id,

    }))
  }
}
