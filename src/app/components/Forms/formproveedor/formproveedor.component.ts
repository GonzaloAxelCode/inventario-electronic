import { createProveedorAction, createProveedorFail, createProveedorSuccess } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectProveedorState } from '@/app/state/selectors/proveedor.selectors';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/legacy';
import { map, Observable, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-formproveedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiInputModule, TuiLoader,


    TuiButton],
  templateUrl: './formproveedor.component.html',
  styleUrl: './formproveedor.component.scss'
})
export class FormproveedorComponent {

  @Output() closeDialogCreateProveedor = new EventEmitter<any>();
  private destroy$ = new Subject<void>();

  proveedorForm: FormGroup;
  loadingCreateProveedor$!: Observable<boolean>
  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions   // 👈 importante
  ) {
    this.proveedorForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      tipo_producto: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.loadingCreateProveedor$ = this.store.select(selectProveedorState).pipe(
      map((state: ProveedorState) => {
        console.log(state)
        return state.loadingCreateProveedor
      })
    );

    // escuchamos solo cuando ocurre la acción proveedorCreateSuccess
    this.actions$.pipe(
      ofType(createProveedorSuccess, createProveedorFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closeDialogCreateProveedor.emit();
    });
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      const newProveedor = this.proveedorForm.value;
      this.store.dispatch(createProveedorAction({ proveedor: newProveedor }));
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
