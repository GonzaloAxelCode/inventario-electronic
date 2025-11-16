import { ComprobanteElectronico, Venta } from '@/app/models/venta.models';

import { anularVenta, generarComprobanteVenta } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDialogContext, TuiExpand, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiBadge, TuiChip, TuiCopy } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-dialogventadetail',
  standalone: true,
  imports: [CommonModule, TuiIcon, TuiLoader, TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiChip, TuiLoader, TuiExpand, TuiCopy],
  templateUrl: './dialogventadetail.component.html',
  styleUrl: './dialogventadetail.component.scss'
})
export class DialogventadetailComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Venta>>();
  public venta: Venta = this.context.data ?? {} as Venta;
  protected expanded = false;
  pdfUrl!: SafeResourceUrl;

  public comprobante: ComprobanteElectronico = this.venta?.comprobante ?? {} as ComprobanteElectronico;
  constructor(private store: Store<AppState>, private sanitizer: DomSanitizer) {


  }

  prevPdfTicket(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url + "#toolbar=1&navpanes=0&scrollbar=0&view=FitH");
  }
  loadingAnularVenta: boolean = false
  public productos_json = JSON.parse(this.venta.productos_json ?? '[]');
  ngOnInit(): void {
    console.log(this.venta);
    this.store.select(selectVenta).subscribe((state: VentaState) => {
      this.loadingAnularVenta = state.loadingNotaCredito;
    });
  }


  stripDomain(url?: string): string {
    if (!url) return '';
    try {
      // Obtener solo la parte del path
      const u = new URL(url);
      let path = u.pathname + u.search + u.hash;

      // Quitar el subdirectorio "axelmovilcomprobantes" si existe
      path = path.replace(/^\/?axelmovilcomprobantes\/?/, '/');

      return "https://pub-6b79c76579594222bdd6f486ae49157e.r2.dev" + path;
    } catch {
      // Si la URL no es válida, usar regex como respaldo
      return url
        .replace(/^https?:\/\/[^\/]+/i, '') // quitar dominio
        .replace(/^\/?axelmovilcomprobantes\/?/, '/'); // quitar subcarpeta
    }
  }


  getValorVentaRedondeado(valor: number) {
    return valor ? parseFloat(valor.toFixed(2)) : 0.0;
  }

  anularVenta(id: number) {
    this.store.dispatch(anularVenta({ ventaId: id, motivo: "Anulación de la operación", tipo_motivo: "01" }))
  }
  realizarComprobante() {
    // Lógica para realizar el comprobante
    const preparedData: any = {
      usuarioId: this.venta.usuario,
      metodoPago: this.venta.metodo_pago,
      formaPago: "Contado",
      tipoComprobante: this.venta.tipo_comprobante,
      cliente: {
        nombre_o_razon_social: this.venta.nombre_cliente,
        nombre_completo: this.venta.nombre_cliente,
        ruc: this.venta.numero_documento_cliente,
        numero: this.venta.numero_documento_cliente
      },
      documento_cliente: this.venta.numero_documento_cliente,
      nombre_cliente: this.venta.nombre_cliente,
      correo_cliente: this.venta.correo_cliente,
      direccion_cliente: this.venta.direccion_cliente,
      telefono_cliente: this.venta.telefono_cliente,
      productos: this.venta.productos,
      is_send_sunat: true,
      is_save_user: true,
      estado: true
    }


    this.store.dispatch(generarComprobanteVenta({ ventaId: this.venta.id }));

  }
}
