

import { ComprobanteElectronico, Venta } from '@/app/models/venta.models';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { anularVenta, generarComprobanteVenta, generarComprobanteVentaExito } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiExpand, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiChip, TuiCopy, TuiPreview, TuiPreviewDialogDirective, TuiPreviewTitle, TuiSegmented, TuiTabs } from '@taiga-ui/kit';
import { PolymorpheusOutlet } from '@taiga-ui/polymorpheus';
import * as dayjs from 'dayjs';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import { Subject, takeUntil } from 'rxjs';
//@ts-ignore
dayjs.extend(advancedFormat);    //@ts-ignore
dayjs.extend(localizedFormat);
dayjs.locale('es');
@Component({
  selector: 'app-todaysale',
  standalone: true,
  imports: [CommonModule, TuiSegmented, TuiTabs, TuiTextfield, ReactiveFormsModule, FormsModule, PolymorpheusOutlet, TuiPreviewDialogDirective, TuiPreview, TuiPreviewTitle, TuiIcon, TuiLoader, TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiChip, TuiLoader, TuiExpand, TuiCopy],
  templateUrl: './todaysale.component.html',
  styleUrl: './todaysale.component.scss'
})
export class TodaysaleComponent {

  selectedState: 'original' | 'anulado' = 'original';
  public venta: Venta = {} as Venta;
  protected expanded = false;
  pdfUrl!: SafeResourceUrl;

  public comprobante: ComprobanteElectronico = this.venta?.comprobante ?? {} as ComprobanteElectronico;
  constructor(private store: Store<AppState>, private sanitizer: DomSanitizer, private actions$: Actions
  ) {
    console.log(this.venta)

  }

  prevPdfTicket(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url + "#toolbar=1&navpanes=0&scrollbar=0&view=FitH");
  }
  loadingAnularVenta: boolean = false
  loadingGenerarComprobante: boolean = false
  public productos_json = JSON.parse(this.venta.productos_json ?? '[]');
  ngOnInit(): void {

    this.store.select(selectVenta).subscribe((state: VentaState) => {
      this.loadingAnularVenta = state.loadingNotaCredito;
      this.loadingGenerarComprobante = state.loadingGenerarComprobante
      // Ordenar y obtener la última venta por fecha_hora
      const ultimaVenta = [...state.ventasToday].sort(
        (a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
      )[0];

      // Mantener tu lógica original
      this.venta = ultimaVenta;
      this.comprobante = ultimaVenta?.comprobante;
    });
  }
  onSetImageProduct(img: any, name: any) {

    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";

    const imagenFinal = img
      ? URL_BASE + img
      : placeholder;

    this.titles = [name || "Producto Sin Nombre"];
    this.content = [imagenFinal];
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

  anularVenta(id: number, doc: any) {
    this.store.dispatch(anularVenta({
      ventaId: id,
      motivo: "Anulación de la operación", tipo_motivo: "01",
      anonima: doc == "00000000"
    }))
  }
  private destroy$ = new Subject<void>();

  realizarComprobante() {

    this.store.dispatch(generarComprobanteVenta({ ventaId: this.venta.id }));
    this.actions$.pipe(
      ofType(generarComprobanteVentaExito),
      takeUntil(this.destroy$)
    ).subscribe(({ ventad }: any) => {
      //hacer algo
    });
  }
  open = false;
  protected titles = ["Producto Sin Imagen"]
  protected content = ['https://st2.depositphotos.com/1561359/12101/v/950/depositphotos_121012076-stock-illustration-blank-photo-icon.jpg']
  URL_BASE = URL_BASE
  protected index = 0;
  protected length = 1;

  enviarWhatsApp(
    event: MouseEvent,
    pdfUrl: string,
    telefono: string
  ) {
    event.preventDefault();   // ⛔ evita navegación
    event.stopPropagation();  // ⛔ evita clicks fantasmas

    const mensaje = `Hola te saluda Movil Axel,
Te envío tu comprobante electrónico:
${pdfUrl}   - Gracias por tu compra. ¡Esperamos verte de nuevo pronto!`;

    const url = `https://wa.me/51${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  }

  numeroTelefonico = '';
  numeroInvalido = true;

  validarNumero(valor: string): void {
    const soloNumeros = valor.replace(/\D/g, '');

    // solo validar, NO modificar el ngModel directamente
    this.numeroInvalido = soloNumeros.length !== 9;
  }


  // Uso:
}
