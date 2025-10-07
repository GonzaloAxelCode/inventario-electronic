import { ComprobanteElectronico, Venta } from '@/app/models/venta.models';
import { anularVenta } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiChip } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogventadetail',
  standalone: true,
  imports: [CommonModule, TuiLoader, TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiChip, TuiLoader],
  templateUrl: './dialogventadetail.component.html',
  styleUrl: './dialogventadetail.component.scss'
})
export class DialogventadetailComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Venta>>();
  public venta: Venta = this.context.data ?? {} as Venta;

  public comprobante: ComprobanteElectronico = this.venta?.comprobante ?? {} as ComprobanteElectronico;
  constructor(private store: Store<AppState>) {

  }
  loadingAnularVenta: boolean = false
  public productos_json = JSON.parse(this.venta.productos_json ?? '[]');
  ngOnInit(): void {
    console.log(this.venta);
    this.store.select(selectVenta).subscribe((state: VentaState) => {
      this.loadingAnularVenta = state.loadingNotaCredito;
    });
  }

  getValorVentaRedondeado(valor: number) {
    return valor ? parseFloat(valor.toFixed(2)) : 0.0;
  }

  anularVenta(id: number) {
    this.store.dispatch(anularVenta({ ventaId: id, motivo: "Anulación de la operación", tipo_motivo: "01" }))
  }
}
