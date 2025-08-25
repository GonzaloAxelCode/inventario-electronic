import { Caja } from '@/app/models/caja.models';
import { cerrarCaja } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { selectCaja } from '@/app/state/selectors/caja.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { AsyncPipe, CommonModule, NgForOf } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiFormatNumberPipe, TuiTitle } from '@taiga-ui/core';
import { TuiCell } from '@taiga-ui/layout';

@Component({
  selector: 'app-dialogcerrarcaja',
  standalone: true,
  imports: [CommonModule, TuiAppearance, TuiButton, AsyncPipe, NgForOf, TuiFormatNumberPipe, TuiTable, TuiTitle, TuiCell],
  templateUrl: './dialogcerrarcaja.component.html',
  styleUrl: './dialogcerrarcaja.component.scss'
})
export class DialogcerrarcajaComponent {
  caja!: Caja
  userId!: number
  constructor(private store: Store<AppState>) {


  }
  ngOnInit(): void {
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })
    this.store.select(selectCaja).subscribe((state) => {
      this.caja = state.caja
    });
  }
  cerrarCaja() {
    this.store.dispatch(cerrarCaja({
      cajaId: this.caja.id,

    }))
  }
}
