import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@/app/state/app.state';
import { cargarReporteMensual, cargarTopProductosMes, cargarTopCategoriasMes } from '@/app/state/actions/venta.actions';
import { selectReporteMensual, selectLoadingReporteMensual, selectTopProductosMes, selectLoadingTopProductosMes, selectTopCategoriasMes, selectLoadingTopCategoriasMes } from '@/app/state/selectors/venta.selectors';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { Subject, takeUntil } from 'rxjs';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-dashboard-general-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-general-stats.component.html',
  styleUrl: './dashboard-general-stats.component.scss'
})
export class DashboardGeneralStatsComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();

  monthNames = MONTH_NAMES;
  currentYear = new Date().getFullYear();
  yearNumbers = [this.currentYear, this.currentYear - 1, this.currentYear - 2];

  // Selectores por sección
  selectedMonth = MONTH_NAMES[new Date().getMonth()];
  selectedYear = this.currentYear;

  // Reporte mensual desde API
  resumenVentas = {
    totalVentas: 0,
    totalTransacciones: 0,
    ticketPromedio: 0,
    clientesAtendidos: 0,
    vsMesAnterior: 0,
  };
  loadingReporteMensual = false;

  // Compras del mes
  comprasMes: { proveedor: string; total: number; items: number; fecha: string }[] = [];
  totalComprasMes = 0;

  // Top productos por mes
  topProductosMes: { nombre: string; cantidad: number; ingresos: number; imagen: string | null }[] = [];
  loadingTopProductosMes = false;

  // Categorías más vendidas por mes
  categoriasMes: { nombre: string; cantidad: number; ingresos: number; imagen: string | null; imagenes: string[] }[] = [];
  loadingTopCategoriasMes = false;

  ngOnInit(): void {
    // Suscribirse al reporte mensual
    this.store.select(selectReporteMensual)
      .pipe(takeUntil(this.destroy$))
      .subscribe(reporte => {
        if (reporte) {
          this.resumenVentas = {
            totalVentas: reporte.total_ventas ?? 0,
            totalTransacciones: reporte.num_comprobantes ?? 0,
            ticketPromedio: (reporte.num_comprobantes ?? 0) > 0 ? (reporte.total_ventas ?? 0) / (reporte.num_comprobantes ?? 1) : 0,
            clientesAtendidos: reporte.clientes_atendidos ?? 0,
            vsMesAnterior: reporte.porcentaje_vs_mes_anterior ?? 0,
          };
        }
      });

    // Suscribirse al loading
    this.store.select(selectLoadingReporteMensual)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingReporteMensual = loading);

    // Suscribirse a top productos del mes
    this.store.select(selectTopProductosMes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data && data.productos.length > 0) {
          this.topProductosMes = data.productos.map(p => ({
            nombre: p.nombre,
            cantidad: p.total_unidades,
            ingresos: p.total_ingresos,
            imagen: this.resolverImagen((p as any).imagen),
          }));
        }
      });

    // Suscribirse al loading de top productos
    this.store.select(selectLoadingTopProductosMes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingTopProductosMes = loading);

    // Suscribirse a top categorías del mes
    this.store.select(selectTopCategoriasMes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data && data.categorias.length > 0) {
          this.categoriasMes = data.categorias.map(c => ({
            nombre: c.nombre,
            cantidad: c.total_unidades,
            ingresos: c.total_ingresos,
            imagen: this.resolverImagen((c as any).imagen),
            imagenes: (((c as any).imagenes ?? []) as any[]).map(u => this.resolverImagen(u)).filter((u): u is string => !!u).slice(0, 4),
          }));
        }
      });

    // Suscribirse al loading de top categorías
    this.store.select(selectLoadingTopCategoriasMes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingTopCategoriasMes = loading);

    // Cargar reporte del mes actual
    this.loadReporteMensual();

    // Cargar top productos del mes
    this.loadTopProductosMes();

    // Cargar top categorías del mes
    this.loadTopCategoriasMes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReporteMensual(): void {
    let monthIndex = this.monthNames.indexOf(this.selectedMonth);
    if (monthIndex < 0) monthIndex = new Date().getMonth();
    this.store.dispatch(cargarReporteMensual({ month: monthIndex, year: this.selectedYear }));
  }

  loadTopProductosMes(): void {
    let monthIndex = this.monthNames.indexOf(this.selectedMonth);
    if (monthIndex < 0) monthIndex = new Date().getMonth();
    this.store.dispatch(cargarTopProductosMes({ month: monthIndex, year: this.selectedYear }));
  }

  resolverImagen(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    if (s.startsWith('data:')) return s;
    const mediaIdx = s.indexOf('/media/');
    if (mediaIdx >= 0) return URL_BASE + s.slice(mediaIdx);
    if (s.startsWith('http')) return s;
    return URL_BASE + (s.startsWith('/') ? s : '/' + s);
  }

  loadTopCategoriasMes(): void {
    let monthIndex = this.monthNames.indexOf(this.selectedMonth);
    if (monthIndex < 0) monthIndex = new Date().getMonth();
    this.store.dispatch(cargarTopCategoriasMes({ month: monthIndex, year: this.selectedYear }));
  }

  onMonthChange(): void {
    this.loadReporteMensual();
    this.loadTopProductosMes();
    this.loadTopCategoriasMes();
  }

  onYearChange(): void {
    this.loadReporteMensual();
    this.loadTopProductosMes();
    this.loadTopCategoriasMes();
  }

  getEmpleadoBarHeight(ventas: number): number {
    return 0;
  }

  getComparisonClass(value: number | undefined | null): string {
    return (value ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  getMargenClass(margen: number): string {
    if (margen >= 50) return 'text-emerald-600 dark:text-emerald-400';
    if (margen >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }
}
