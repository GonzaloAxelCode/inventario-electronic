import { GuiaRemisionRemitente } from '@/app/models/guia-remision.models';
import { anularGuia } from '@/app/state/actions/guia-remision.actions';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-detalleguia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalleguia.component.html',
  styleUrl: './detalleguia.component.scss',
})
export class DetalleguiaComponent {

  private store = inject(Store);

  @Input() guia!: GuiaRemisionRemitente;
  @Output() cerrar = new EventEmitter<void>();

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'EMITIDA': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'EN_TRANSITO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ENTREGADA': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ANULADA': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  formatoLargo(fecha: string): string {
    return dayjs(fecha).format('dddd, D [de] MMMM [de] YYYY');
  }

  formatoCorto(fecha: string): string {
    return dayjs(fecha).format('D/MM/YYYY');
  }

  getTotalCantidad(): number {
    return this.guia.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  getTotalPeso(): number {
    return this.guia.items.reduce((sum, item) => sum + (item.peso_kg || 0), 0);
  }

  onAnular() {
    if (confirm('¿Estás seguro de anular esta guía de remisión?')) {
      this.store.dispatch(anularGuia({ id: this.guia.id }));
      this.cerrar.emit();
    }
  }

  onImprimir() {
    window.print();
  }
}
