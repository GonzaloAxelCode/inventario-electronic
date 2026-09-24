import { PlanSuscripcion } from '@/app/models/tienda.models';
import { TiendaService } from '@/app/services/tienda.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDataList, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogcreateplan',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TuiButton, TuiDataList, TuiLoader,
    TuiInputModule, TuiSelectModule,
  ],
  templateUrl: './dialogcreateplan.component.html',
})
export class DialogcreateplanComponent {
  protected readonly context = injectContext<TuiDialogContext<PlanSuscripcion | null, unknown>>();

  createForm!: FormGroup;
  creating = false;
  createError: string | null = null;

  readonly monedas = ['PEN', 'USD'];
  readonly periodos = ['mensual', 'anual'];

  constructor(
    private fb: FormBuilder,
    private tiendaService: TiendaService,
    private alerts: TuiAlertService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.createForm = this.fb.group({
      nombre_plan: ['', Validators.required],
      descripcion: [''],
      lista_descripcion: this.fb.array([]),
      limite_boletas: [100, [Validators.required, Validators.min(0)]],
      limite_facturas: [100, [Validators.required, Validators.min(0)]],
      limite_personal: [10, [Validators.required, Validators.min(0)]],
      limite_productos: [500, [Validators.required, Validators.min(0)]],
      precio_mensual: ['99.00', Validators.required],
      precio_anual: ['990.00'],
      moneda: ['PEN', Validators.required],
      periodo_facturacion: ['mensual', Validators.required],
      activo: [true],
    });
    this.addCaracteristica();
  }

  caracteristicas(): FormArray {
    return this.createForm.get('lista_descripcion') as FormArray;
  }

  addCaracteristica(valor = ''): void {
    this.caracteristicas().push(this.fb.control(valor, Validators.required));
    this.cdRef.markForCheck();
  }

  removeCaracteristica(index: number): void {
    this.caracteristicas().removeAt(index);
    this.cdRef.markForCheck();
  }

  cancel(): void {
    this.context.completeWith(null);
  }

  onSubmit(): void {
    if (this.createForm.invalid || this.creating) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.creating = true;
    this.createError = null;
    this.cdRef.markForCheck();
    const lista: string[] = this.caracteristicas().value
      .map((v: unknown) => String(v ?? '').trim())
      .filter((v: string) => v.length > 0);
    const raw = this.createForm.value;
    const body = {
      ...raw,
      lista_descripcion: lista,
      precio_anual: String(raw.precio_anual ?? '').trim() === '' ? null : raw.precio_anual,
    };
    this.tiendaService.createPlan(body).subscribe({
      next: (creado) => {
        this.creating = false;
        this.alerts.open(`Plan "${creado.nombre_plan}" creado.`).subscribe();
        this.context.completeWith(creado);
      },
      error: (err) => {
        this.creating = false;
        const e = err?.error;
        this.createError = e?.nombre_plan?.[0]
          || e?.error
          || (typeof e === 'string' ? e : null)
          || (err?.status === 403 ? 'Solo un superusuario puede crear planes.'
          : 'No se pudo crear el plan. Revisa los datos.');
        console.error('createPlan error', err);
        this.cdRef.markForCheck();
      },
    });
  }
}
