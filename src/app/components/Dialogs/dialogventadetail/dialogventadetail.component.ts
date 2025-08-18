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
  imports: [CommonModule, TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiChip,],
  templateUrl: './dialogventadetail.component.html',
  styleUrl: './dialogventadetail.component.scss'
})
export class DialogventadetailComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Venta>>>();
  public venta: Partial<Venta> = this.context.data ?? {};

  public comprobante: ComprobanteElectronico = this.venta?.comprobante ?? {} as ComprobanteElectronico;

  public productos_json = JSON.parse(this.venta.productos_json ?? '[]');
  ngOnInit(): void {
    console.log(this.venta);
  }

  getValorVentaRedondeado(valor: number) {
    return valor ? parseFloat(valor.toFixed(2)) : 0.0;
  }
}
