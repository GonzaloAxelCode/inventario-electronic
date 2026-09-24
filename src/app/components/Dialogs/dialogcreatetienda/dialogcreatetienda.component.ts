import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Tienda } from '@/app/models/tienda.models';
import { CommonModule } from '@angular/common';
import { FormaddstoreComponent } from '../../Forms/formaddstore/formaddstore.component';

export interface CrearTiendaDialogData {
  /** Padre prefijado al crear sucursal desde su tarjeta (jerarquía bloqueada). */
  tiendaPadre?: Tienda | null;
}

@Component({
  selector: 'app-dialogcreatetienda',
  standalone: true,
  imports: [CommonModule, FormaddstoreComponent],
  templateUrl: './dialogcreatetienda.component.html',
  styleUrl: './dialogcreatetienda.component.scss'
})
export class DialogcreatetiendaComponent {
  protected readonly context = injectContext<TuiDialogContext<void, CrearTiendaDialogData | undefined>>();

  close(): void {
    this.context.completeWith();
  }
}
