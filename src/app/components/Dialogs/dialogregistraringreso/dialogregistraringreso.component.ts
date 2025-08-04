import { realizarIngreso } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { selectAuth } from '@/app/state/selectors/auth.selectors';
import { selectCaja } from '@/app/state/selectors/caja.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiInputNumber } from '@taiga-ui/kit';
import { TuiTextareaModule } from '@taiga-ui/legacy';
@Component({
  selector: 'app-dialogregistraringreso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiTextareaModule, TuiFieldErrorPipe, TuiAppearance, TuiButton,
    TuiInputNumber,
    TuiTextfield, TuiIcon],
  templateUrl: './dialogregistraringreso.component.html',
  styleUrl: './dialogregistraringreso.component.scss'
})
export class DialogregistraringresoComponent {
  protected testForm = new FormGroup({

    monto: new FormControl("", Validators.required),
    descripccion: new FormControl('', Validators.required),

  });
  id_caja!: number
  userId: number = 0;

  constructor(private store: Store<AppState>) { }
  ngOnInit(): void {
    this.store.select(selectCaja).subscribe((state) => {
      this.id_caja = state.caja.id
    });
    this.store.pipe(select(selectAuth)).subscribe(authState => {
      this.userId = Number(authState?.id_user) || 0;
    });
  }
  onSubmit() {
    console.log(this.id_caja,)
    if (this.testForm.valid) {
      console.log(this.testForm.value)
      this.store.dispatch(realizarIngreso({
        cajaId: this.id_caja,
        userId: this.userId,
        monto: this.testForm.value.monto,
        descripcion: this.testForm.value.descripccion,
      }))
    }
  }
}



