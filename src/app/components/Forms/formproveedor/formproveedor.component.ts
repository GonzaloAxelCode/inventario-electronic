import { createProveedorAction, createProveedorFail, createProveedorSuccess } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectProveedorState } from '@/app/state/selectors/proveedor.selectors';
import { ConsultaService } from '@/app/services/consultas.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiButton, TuiDataList, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { debounceTime, distinctUntilChanged, map, Observable, Subject, takeUntil } from 'rxjs';

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
  private consultaService = inject(ConsultaService);

  proveedorForm: FormGroup;
  loadingCreateProveedor$!: Observable<boolean>
  consultandoRuc = false;
  rucError: string | null = null;
  rucConsultadoOk = false;

  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions) {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      ruc: ['', [Validators.pattern(/^\d{11}$/)]],
      razon_social: [{ value: '', disabled: true }, [Validators.maxLength(255)]],
      direccion: [''],
      telefono: ['', [Validators.pattern(/^\d{7,15}$/)]],
      email: ['', [Validators.email]],
      contacto: ['', [Validators.maxLength(100)]],
      tipo_producto: ['', [Validators.maxLength(100)]],
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

    this.proveedorForm.get('ruc')?.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((v) => {
      const ruc = String(v ?? '').trim();
      if (/^\d{11}$/.test(ruc)) {
        this.consultarRuc();
      } else {
        this.rucConsultadoOk = false;
        this.rucError = null;
      }
    });
  }

  consultarRuc(): void {
    const ruc = String(this.proveedorForm.get('ruc')?.value ?? '').trim();
    this.proveedorForm.get('ruc')?.markAsTouched();
    if (!/^\d{11}$/.test(ruc) || this.consultandoRuc) {
      if (!/^\d{11}$/.test(ruc)) {
        this.rucError = 'Ingresa un RUC válido de 11 dígitos.';
      }
      return;
    }
    this.consultandoRuc = true;
    this.rucError = null;
    this.rucConsultadoOk = false;
    this.consultaService.consultarRUC(ruc).subscribe({
      next: (resp: any) => {
        this.consultandoRuc = false;
        const razon = resp?.nombre_o_razon_social || resp?.razon_social ||
          resp?.nombre_completo || resp?.razonSocial || '';
        if (razon) {
          this.rucConsultadoOk = true;
          this.proveedorForm.patchValue({ razon_social: razon }, { emitEvent: false });
          if (!String(this.proveedorForm.get('nombre')?.value ?? '').trim()) {
            this.proveedorForm.patchValue({ nombre: razon }, { emitEvent: false });
          }
          if (resp?.direccion || resp?.domicilio_fiscal) {
            this.proveedorForm.patchValue(
              { direccion: resp.direccion || resp.domicilio_fiscal },
              { emitEvent: false }
            );
          }
        } else {
          this.rucError = 'SUNAT no devolvió razón social para este RUC.';
        }
      },
      error: () => {
        this.consultandoRuc = false;
        this.rucError = 'No se pudo consultar el RUC. Verifica tu conexión e intenta de nuevo.';
      }
    });
  }

  onCancel(): void {
    this.closeDialogCreateProveedor.emit();
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      const newProveedor = { ...this.proveedorForm.getRawValue(), calificacion: 0 };
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