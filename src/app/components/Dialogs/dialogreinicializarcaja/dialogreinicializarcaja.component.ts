import { reinicializarCaja } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { selectCaja } from '@/app/state/selectors/caja.selectors';
import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiNotification, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { TuiInputModule } from '@taiga-ui/legacy';
import { map } from 'rxjs';
@Component({
  selector: 'app-dialogreinicializarcaja',
  standalone: true,
  imports: [CommonModule, TuiAppearance, TuiButton, TuiTextfield, TuiAppearance, TuiButton, FormsModule, ReactiveFormsModule, TuiNotification, TuiInputNumber, TuiInputModule],
  templateUrl: './dialogreinicializarcaja.component.html',
  styleUrl: './dialogreinicializarcaja.component.scss'
})
export class DialogreinicializarcajaComponent {

  protected readonly form = new FormGroup({
    saldo_inicial: new FormControl("", Validators.required),
  });
  constructor(private store: Store<AppState>) { }
  id_caja!: number
  userId!: number
  tiendaUser!: number
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
  }
  onSubmit() {
    this.store.dispatch(reinicializarCaja({

      cajaId: this.id_caja,

      saldoInicial: this.form.value.saldo_inicial,
    }))
  }

}
