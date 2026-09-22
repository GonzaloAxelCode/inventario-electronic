import { GuiaRemisionRemitente } from '@/app/models/guia-remision.models';
import { anularGuia, enviarGuia, enviarGuiaError, enviarGuiaExito } from '@/app/state/actions/guia-remision.actions';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as dayjs from 'dayjs';
import { take } from 'rxjs';

@Component({
  selector: 'app-detalleguia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalleguia.component.html',
  styleUrl: './detalleguia.component.scss',
})
export class DetalleguiaComponent {

  private store = inject(Store);
  private actions$ = inject(Actions);

  @Input() guia!: GuiaRemisionRemitente;
  @Output() cerrar = new EventEmitter<void>();

  enviando = false;

  get esBorrador(): boolean {
    return (this.guia?.estado || '').toUpperCase() === 'BORRADOR';
  }

  getEstadoClass(estado: string): string {
    switch ((estado || '').toUpperCase()) {
      case 'EMITIDA': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'EN_TRANSITO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ENTREGADA': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ANULADA': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'ACEPTADO': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'RECHAZADO': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'BORRADOR': return 'bg-stone-200 text-stone-700 dark:bg-white/10 dark:text-stone-300';
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

  onEnviarSunat() {
    if (this.enviando) return;
    this.enviando = true;
    this.store.dispatch(enviarGuia({ id: this.guia.id }));
    this.actions$.pipe(ofType(enviarGuiaExito), take(1)).subscribe(({ guia, envio }) => {
      this.enviando = false;
      if (guia && (guia as any).id) {
        this.guia = { ...(guia as GuiaRemisionRemitente), envio: envio ?? this.guia.envio };
      } else if (envio) {
        this.guia = { ...this.guia, envio };
      }
    });
    this.actions$.pipe(ofType(enviarGuiaError), take(1)).subscribe(() => {
      this.enviando = false;
    });
  }

  onImprimir() {
    window.print();
  }
}
