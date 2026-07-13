import { GuiaRemisionItem, Transportista } from '@/app/models/guia-remision.models';
import { crearGuia } from '@/app/state/actions/guia-remision.actions';
import { AppState } from '@/app/state/app.state';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-formguia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formguia.component.html',
  styleUrl: './formguia.component.scss',
})
export class FormguiaComponent {

  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);

  @Output() cancelar = new EventEmitter<void>();

  hoy = new Date().toISOString().split('T')[0];

  form: FormGroup = this.fb.group({
    fecha_emision: [this.hoy, Validators.required],
    fecha_traslado: [this.hoy, Validators.required],

    ruc_destinatario: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    razon_social_destinatario: ['', Validators.required],
    direccion_destinatario: ['', Validators.required],

    punto_partida: ['Av. Industrial 1235, San Martin de Porres, Lima', Validators.required],
    punto_llegada: ['', Validators.required],

    motivo_traslado: ['VENTA', Validators.required],

    nombre_chofer: ['', Validators.required],
    dni_chofer: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    placa_vehiculo: ['', Validators.required],
    numero_licencia: ['', Validators.required],

    peso_total_kg: [0, [Validators.required, Validators.min(0.1)]],
    num_bultos: [1, [Validators.required, Validators.min(1)]],

    observaciones: [''],
  });

  items: GuiaRemisionItem[] = [
    { codigo: '', descripcion: '', unidad_medida: 'PIEZA', cantidad: 1, peso_kg: 0 },
  ];

  unidadesMedida = ['PIEZA', 'CAJA', 'KG', 'GALON', 'JUEGO', 'METRO', 'ROLLO', 'PAR', 'DOCENA'];

  addItem() {
    this.items.push({ codigo: '', descripcion: '', unidad_medida: 'PIEZA', cantidad: 1, peso_kg: 0 });
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
    }
  }

  updateItem(index: number, field: keyof GuiaRemisionItem, value: any) {
    if (field === 'cantidad' || field === 'peso_kg') {
      this.items[index][field] = Number(value) || 0;
    } else {
      (this.items[index] as any)[field] = value;
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    this.store.dispatch(crearGuia({
      guia: {
        fecha_emision: v.fecha_emision,
        fecha_traslado: v.fecha_traslado,
        ruc_destinatario: v.ruc_destinatario,
        razon_social_destinatario: v.razon_social_destinatario,
        direccion_destinatario: v.direccion_destinatario,
        punto_partida: v.punto_partida,
        punto_llegada: v.punto_llegada,
        motivo_traslado: v.motivo_traslado,
        datos_transportista: {
          razon_social: 'Transportes Rápidos del Sur S.A.C.',
          ruc: '20456789012',
          nombre_chofer: v.nombre_chofer,
          dni_chofer: v.dni_chofer,
          placa_vehiculo: v.placa_vehiculo,
          numero_licencia: v.numero_licencia,
        },
        items: this.items.filter(i => i.descripcion),
        peso_total_kg: v.peso_total_kg,
        num_bultos: v.num_bultos,
        observaciones: v.observaciones,
      }
    }));

    this.cancelar.emit();
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
