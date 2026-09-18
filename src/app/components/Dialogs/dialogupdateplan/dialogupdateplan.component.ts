import { PlanSuscripcion } from '@/app/models/tienda.models';
import { TiendaService } from '@/app/services/tienda.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButton, TuiDataList, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogupdateplan',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TuiButton, TuiDataList, TuiLoader,
    TuiInputModule, TuiSelectModule,
  ],
  templateUrl: './dialogupdateplan.component.html',
  styleUrl: './dialogupdateplan.component.scss',
})
export class DialogupdateplanComponent {
  protected readonly context = injectContext<TuiDialogContext<PlanSuscripcion | null, PlanSuscripcion>>();
  public plan: PlanSuscripcion = this.context.data;

  editForm!: FormGroup;
  updating = false;
  updateError: string | null = null;

  readonly monedas = ['PEN', 'USD'];
  readonly periodos = ['mensual', 'anual'];

  constructor(
    private fb: FormBuilder,
    private tiendaService: TiendaService,
    private alerts: TuiAlertService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.editForm = this.fb.group({
      nombre_plan: [this.plan.nombre_plan ?? '', Validators.required],
      descripcion: [this.plan.descripcion ?? ''],
      lista_descripcion: this.fb.array([]),
      limite_boletas: [this.plan.limite_boletas ?? 0, [Validators.required, Validators.min(0)]],
      limite_facturas: [this.plan.limite_facturas ?? 0, [Validators.required, Validators.min(0)]],
      limite_personal: [this.plan.limite_personal ?? 0, [Validators.required, Validators.min(0)]],
      precio_mensual: [this.plan.precio_mensual ?? '', Validators.required],
      precio_anual: [this.plan.precio_anual ?? '', Validators.required],
      moneda: [this.plan.moneda ?? 'PEN', Validators.required],
      periodo_facturacion: [this.plan.periodo_facturacion ?? 'mensual', Validators.required],
      activo: [this.plan.activo ?? true],
    });
    for (const item of this.plan.lista_descripcion ?? []) {
      this.addCaracteristica(item);
    }
  }

  caracteristicas(): FormArray {
    return this.editForm.get('lista_descripcion') as FormArray;
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
    if (this.editForm.invalid || this.updating) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.updating = true;
    this.updateError = null;
    this.cdRef.markForCheck();
    const lista: string[] = this.caracteristicas().value
      .map((v: unknown) => String(v ?? '').trim())
      .filter((v: string) => v.length > 0);
    const body = { ...this.editForm.value, lista_descripcion: lista };
    this.tiendaService.updatePlan(this.plan.id, body).subscribe({
      next: (actualizado) => {
        this.updating = false;
        this.alerts.open(`Plan "${actualizado.nombre_plan}" actualizado.`).subscribe();
        this.context.completeWith(actualizado);
      },
      error: (err) => {
        this.updating = false;
        const e = err?.error;
        this.updateError = e?.nombre_plan?.[0]
          || e?.error
          || (typeof e === 'string' ? e : null)
          || (err?.status === 403 ? 'Solo un superusuario puede actualizar planes.'
          : 'No se pudo actualizar el plan. Revisa los datos.');
        console.error('updatePlan error', err);
        this.cdRef.markForCheck();
      },
    });
  }
}
