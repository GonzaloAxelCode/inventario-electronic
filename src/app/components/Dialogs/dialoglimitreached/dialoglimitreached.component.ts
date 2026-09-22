import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface LimiteAlcanzadoData {
  tipo: 'Boleta' | 'Factura' | 'Producto' | 'Personal';
  usados: number;
  limite: number;
  diasRestantes: number | null;
  fechaReset: string | null;
}

@Component({
  selector: 'app-dialoglimitreached',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './dialoglimitreached.component.html',
  styleUrl: './dialoglimitreached.component.scss',
})
export class DialoglimitreachedComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, LimiteAlcanzadoData>>();

  get data(): LimiteAlcanzadoData {
    return this.context.data;
  }

  get tipoLabel(): string {
    switch (this.data.tipo) {
      case 'Boleta': return 'boleta';
      case 'Factura': return 'factura';
      case 'Producto': return 'productos';
      case 'Personal': return 'personal';
    }
  }

  get unidadLabel(): string {
    switch (this.data.tipo) {
      case 'Boleta': return 'boletas del mes';
      case 'Factura': return 'facturas del mes';
      case 'Producto': return 'productos';
      case 'Personal': return 'personal';
    }
  }

  get esMensual(): boolean {
    return this.data.tipo === 'Boleta' || this.data.tipo === 'Factura';
  }

  get accionLabel(): string {
    switch (this.data.tipo) {
      case 'Producto': return 'seguir creando productos';
      case 'Personal': return 'seguir agregando personal';
      default: return 'seguir emitiendo';
    }
  }

  onClose(): void {
    this.context.completeWith(false);
  }

  onVerPlan(): void {
    this.context.completeWith(true);
  }
}
