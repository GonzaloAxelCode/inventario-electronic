import { ComprobanteElectronico, Venta } from '@/app/models/venta.models';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { TuiBadge, TuiChip } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogventadetail',
  standalone: true,
  imports: [CommonModule, TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiChip],
  templateUrl: './dialogventadetail.component.html',
  styleUrl: './dialogventadetail.component.scss'
})
export class DialogventadetailComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Venta>>>();
  public venta: Partial<Venta> = this.context.data ?? {};

  public comprobante: ComprobanteElectronico = this.venta?.comprobante ?? {} as ComprobanteElectronico;

  public productos_json = (() => {
    try {
      return this.venta.productos_json ? JSON.parse(this.venta.productos_json) : [];
    } catch (error) {
      console.error("Error al parsear productos_json:", error);
      return [];
    }
  })();
  constructor() {


  }
  getValorVentaRedondeado(valor: number): string {
    return valor.toFixed(2);
  }
}
