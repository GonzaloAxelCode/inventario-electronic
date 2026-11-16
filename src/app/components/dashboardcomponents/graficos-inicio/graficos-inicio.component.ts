import { VentaService } from '@/app/services/venta.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiHint } from '@taiga-ui/core';
import { DashboardPaymentMethodsComponent } from '../dashboard-payment-methods/dashboard-payment-methods.component';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-graficos-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiHint, DashboardPaymentMethodsComponent],
  templateUrl: './graficos-inicio.component.html',
  styleUrl: './graficos-inicio.component.scss'
})
export class GraficosInicioComponent implements OnInit {
  @Input() activeTab: string = 'general';
  Math = Math;
  private readonly ventaService = inject(VentaService);

  monthNames = MONTH_NAMES;
  currentYear = new Date().getFullYear();
  yearNumbers = [this.currentYear, this.currentYear - 1, this.currentYear - 2];

  ngOnInit(): void {
    this.loadTopProducts();
  }

  onMonthTopChange(monthName: string): void {
    this.selectedMonthTop = monthName;
    this.loadTopProducts();
  }

  onYearTopChange(year: number): void {
    this.selectedYearTop = +year;
    this.loadTopProducts();
  }

  loadTopProducts(): void {
    this.loadingTopProducts = true;
    const monthNum = this.monthNames.indexOf(this.selectedMonthTop) + 1;
    const monthStr = `${this.selectedYearTop}-${String(monthNum).padStart(2, '0')}`;

    this.ventaService.getTopProductsMonth(monthStr).subscribe({
      next: (data) => {
        const getCantidad = (r: any) => r.unidades_vendidas ?? r.cantidad_total_vendida ?? 0;
        const getTotal = (r: any) => r.monto_total_vendido ?? r.total_vendido ?? 0;
        const toRow = (r: any) => ({
          name: r.nombre ?? 'Sin nombre',
          cantidad: getCantidad(r),
          total: getTotal(r),
          imagen: this.resolverImagen(r.imagen),
          imei: r.imei ?? null,
          imei2: r.imei2 ?? null,
        });
        const results: any[] = (data as any).results ?? [];
        const accesoriosSrc: any[] = (data as any).accesorios
          ?? results.filter(r => (r.tipo ?? 'accesorio') !== 'celular');
        const celularesSrc: any[] = (data as any).celulares
          ?? results.filter(r => (r.tipo ?? '') === 'celular');
        this.topAccesorios = accesoriosSrc.slice(0, 10).map(toRow);
        this.topCelulares = celularesSrc.slice(0, 10).map(toRow);
        this.loadingTopProducts = false;
      },
      error: () => {
        this.topAccesorios = [];
        this.topCelulares = [];
        this.loadingTopProducts = false;
      },
    });
  }

  resolverImagen(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    if (s.startsWith('data:')) return s;
    // El snapshot de la venta guarda URLs absolutas con el host del momento de la venta;
    // se reconstruyen contra el backend actual para que la imagen cargue bien.
    const mediaIdx = s.indexOf('/media/');
    if (mediaIdx >= 0) return URL_BASE + s.slice(mediaIdx);
    if (s.startsWith('http')) return s;
    return URL_BASE + (s.startsWith('/') ? s : '/' + s);
  }

  // 5. Top ventas del mes: accesorios y celulares (tablas, sin gráfico)
  topAccesorios: { name: string; cantidad: number; total: number; imagen: string | null }[] = [];
  topCelulares: { name: string; cantidad: number; total: number; imagen: string | null; imei: string | null; imei2: string | null }[] = [];
  loadingTopProducts = true;
  selectedMonthTop = MONTH_NAMES[new Date().getMonth()];
  selectedYearTop = this.currentYear;
}
