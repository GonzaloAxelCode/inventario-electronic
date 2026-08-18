import { createProveedorAction, createProveedorFail, createProveedorSuccess } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectProveedorState } from '@/app/state/selectors/proveedor.selectors';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiButton, TuiDataList, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { map, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-formproveedor',
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
  templateUrl: './formproveedor.component.html',
  styleUrl: './formproveedor.component.scss'
})
export class FormproveedorComponent implements OnInit, OnDestroy {

  @Output() closeDialogCreateProveedor = new EventEmitter<any>();
  private destroy$ = new Subject<void>();
  private alerts = inject(TuiAlertService);

  proveedorForm: FormGroup;
  loadingCreateProveedor$!: Observable<boolean>

  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions) {
    this.proveedorForm = this.fb.group({
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
  }

  ngOnInit() {
    this.loadingCreateProveedor$ = this.store.select(selectProveedorState).pipe(
      map((state: ProveedorState) => state.loadingCreateProveedor)
    );

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