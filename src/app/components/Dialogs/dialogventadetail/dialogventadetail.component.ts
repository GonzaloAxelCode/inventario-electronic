import { ComprobanteElectronico, Venta } from '@/app/models/venta.models';

import { URL_BASE } from '@/app/services/utils/endpoints';
import { anularVenta, generarComprobanteVenta, generarComprobanteVentaExito } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, TuiDialogContext, TuiExpand, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiChip, TuiCopy, TuiDataListWrapper, TuiPreview, TuiPreviewDialogDirective, TuiPreviewTitle, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiInputRangeModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { injectContext } from '@taiga-ui/polymorpheus';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Subject, takeUntil } from 'rxjs';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Actions, ofType } from '@ngrx/effects';
@Component({
  selector: 'app-dialogventadetail',
  standalone: true,
  imports: [CommonModule, TuiPreview,
    TuiPreviewTitle, CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiDataList,
    TuiSelectModule,
    TuiTextareaModule,
    TuiButton,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiChip,
    TuiInputModule,
    TuiAppearance,
    TuiTable,
    TuiBadge,
    InfiniteScrollModule,
    TuiStatus,
    NgForOf,
    ScrollingModule,
    TuiInputRangeModule,
    TuiSearch,
    TuiSkeleton,
    TuiExpand,
    TuiBlockStatus,
    TuiPreview,
    TuiPreviewTitle,
    TuiPreviewDialogDirective, TuiIcon, TuiPreviewDialogDirective, TuiLoader, TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiChip, TuiLoader, TuiExpand, TuiCopy],
  templateUrl: './dialogventadetail.component.html',
  styleUrl: './dialogventadetail.component.scss'
})
export class DialogventadetailComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, Venta>>();
  public venta: Venta = this.context.data ?? {} as Venta;
  protected expanded = false;
  pdfUrl!: SafeResourceUrl;
  protected index = 0;
  protected length = 1;

  public comprobante: ComprobanteElectronico = this.venta?.comprobante ?? {} as ComprobanteElectronico;
  constructor(private store: Store<AppState>, private sanitizer: DomSanitizer, private actions$: Actions
  ) {
    console.log(this.venta)

  }
  URL_BASE = URL_BASE
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
    });
  }

  open = false;
  protected titles = ["Producto Sin Imagen"]
  protected content = ['https://st2.depositphotos.com/1561359/12101/v/950/depositphotos_121012076-stock-illustration-blank-photo-icon.jpg']

  onSetImageProduct(item: any) {
    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";

    const imagenFinal = item?.imagen_producto
      ? URL_BASE + item.imagen_producto
      : placeholder;

    this.titles = [item.descripcion || "Producto Sin Nombre"];
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

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  }


  getValorVentaRedondeado(valor: number) {
    return valor ? parseFloat(valor.toFixed(2)) : 0.0;
  }

  anularVenta(id: number, doc: string) {
    this.store.dispatch(anularVenta({ ventaId: id, motivo: "Anulación de la operación", tipo_motivo: "01", anonima: doc == "00000000" }))
  }
  private destroy$ = new Subject<void>();

  realizarComprobante() {

    this.store.dispatch(generarComprobanteVenta({ ventaId: this.venta.id }));
    this.actions$.pipe(
      ofType(generarComprobanteVentaExito),
      takeUntil(this.destroy$)
    ).subscribe(({ ventad }: any) => {
      this.context.completeWith(true)
    });
  }



  // Uso:

}