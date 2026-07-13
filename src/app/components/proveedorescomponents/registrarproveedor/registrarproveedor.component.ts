import { createProveedorAction, createProveedorFail, createProveedorSuccess } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectProveedores } from '@/app/state/selectors/proveedor.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiButton, TuiDataList, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { map, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-registrarproveedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiInputModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiLoader,
    TuiButton,
    TuiDataList,
    TuiIcon,
  ],
  templateUrl: './registrarproveedor.component.html',
  styleUrl: './registrarproveedor.component.scss'
})
export class RegistrarproveedorComponent implements OnInit, OnDestroy {

  private store = inject(Store<AppState>);
  private fb = inject(FormBuilder);
  private actions$ = inject(Actions);
  private alerts = inject(TuiAlertService);
  private destroy$ = new Subject<void>();

  loadingCreate$!: Observable<boolean>;

  proveedorForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    ruc: ['', [Validators.maxLength(50)]],
    razon_social: ['', [Validators.maxLength(255)]],
    direccion: [''],
    telefono: ['', [Validators.pattern(/^\d{7,15}$/)]],
    email: ['', [Validators.email]],
    contacto: ['', [Validators.maxLength(100)]],
    tipo_producto: ['', [Validators.maxLength(100)]],
    calificacion: [0, [Validators.min(0), Validators.max(5)]],
  });

  ngOnInit() {
    this.loadingCreate$ = this.store.select(selectProveedores).pipe(
      map((state: ProveedorState) => state.loadingCreateProveedor)
    );

    this.actions$.pipe(
      ofType(createProveedorSuccess, createProveedorFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.proveedorForm.reset({
        nombre: '',
        ruc: '',
        razon_social: '',
        direccion: '',
        telefono: '',
        email: '',
        contacto: '',
        tipo_producto: '',
        calificacion: 0,
      });
    });
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      this.store.dispatch(createProveedorAction({ proveedor: this.proveedorForm.value }));
    } else {
      this.alerts.open('Completa los campos obligatorios', {
        label: 'Formulario incompleto',
        appearance: 'warning',
      }).subscribe();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
