import { Venta } from '@/app/models/venta.models';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { VentaService } from '@/app/services/venta.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { catchError, of, timeout } from 'rxjs';

import * as dayjs from 'dayjs';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
//@ts-ignore
dayjs.extend(advancedFormat);    //@ts-ignore
dayjs.extend(localizedFormat);
dayjs.locale('es');

@Component({
  selector: 'app-canceledsales',
  standalone: true,
  imports: [
    CommonModule, NgForOf, NgIf,
    TuiAppearance, TuiButton, TuiBadge, TuiBlockStatus
  ],
  templateUrl: './canceledsales.component.html',
  styleUrl: './canceledsales.component.scss'
})
export class CanceledsalesComponent implements OnInit {
  private readonly dialogServiceVentaDetail = inject(DialogVentaDetailService);
  private readonly ventaService = inject(VentaService);

  loading = true;
  ventas: Venta[] = [];
  totalAnuladas = 0;
  totalMontoAnulado = 0;
  fecha = '';
  URL_BASE = URL_BASE;

  ngOnInit(): void {
    this.loadCancelledSales();
  }

  loadCancelledSales(): void {
    this.loading = true;
    this.ventaService.getDailyCancelledSales().pipe(
      timeout(10000),
      catchError(err => {
        console.error('Error daily-cancelled-sales', err);
        return of({ fecha: '', total_anuladas: 0, total_monto_anulado: 0, ventas: [] } as any);
      })
    ).subscribe({
      next: (res) => {
        this.fecha = res.fecha || '';
        this.totalAnuladas = res.total_anuladas ?? 0;
        this.totalMontoAnulado = res.total_monto_anulado ?? 0;
        this.ventas = res.ventas ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // Helpers UI
  formatoCorto(fecha: string): string {
    if (!fecha) return '--';
    //@ts-ignore
    const txt = dayjs(fecha).format('D, MMM YYYY');
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }
  formatoHora12(fecha: string): string {
    if (!fecha) return '--';
    //@ts-ignore
    return dayjs(fecha).format('h:mm A');
  }
  stripDomain(url?: string): string {
    if (!url) return '';
    try {
      const u = new URL(url);
      let path = u.pathname + u.search + u.hash;
      path = path.replace(/^\/?axelmovilcomprobantes\/?/, '/');
      return "https://pub-6b79c76579594222bdd6f486ae49157e.r2.dev" + path;
    } catch {
      return url.replace(/^https?:\/\/[^\/]+/i, '').replace(/^\/?axelmovilcomprobantes\/?/, '/');
    }
  }
  getProductos(venta: any): any[] {
    try {
      const raw = venta?.productos_json;
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return venta?.productos ?? [];
  }
  protected showDialogVentaDetail(venta: Partial<Venta>): void {
    this.dialogServiceVentaDetail.open(venta).subscribe();
  }
  trackByVentaId = (_: number, v: any) => v?.id ?? _;
}
