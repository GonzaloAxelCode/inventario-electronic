import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@/app/state/app.state';
import { cargarReporteMensual, cargarMetodosPagoRango, cargarTopProductosMes, cargarTopCategoriasMes } from '@/app/state/actions/venta.actions';
import { selectReporteMensual, selectLoadingReporteMensual, selectMetodosPagoRango, selectLoadingMetodosPagoRango, selectTopProductosMes, selectLoadingTopProductosMes, selectTopCategoriasMes, selectLoadingTopCategoriasMes } from '@/app/state/selectors/venta.selectors';
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
  dayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

  // Selectores por sección
  selectedMonth = MONTH_NAMES[new Date().getMonth()];
  selectedYear = this.currentYear;

  // Secciones de RANGO: Métodos de pago
  rangeStartDay = 1;
  rangeStartMonth = MONTH_NAMES[new Date().getMonth()];
  rangeStartYear = this.currentYear;
  rangeEndDay = new Date().getDate();
  rangeEndMonth = MONTH_NAMES[new Date().getMonth()];
  rangeEndYear = this.currentYear;

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
  comprasMes = [
    { proveedor: 'Distribuidora Lima SAC', total: 12500.00, items: 45, fecha: '05/08/2026' },
    { proveedor: 'Mayorista Central', total: 8900.00, items: 32, fecha: '12/08/2026' },
    { proveedor: 'Importaciones Fast', total: 5600.00, items: 18, fecha: '20/08/2026' },
  ];
  totalComprasMes = 27000.00;

  // Top productos por mes
  topProductosMes = [
    { nombre: 'Gaseosa 600ml', cantidad: 156, ingresos: 546.00 },
    { nombre: 'Pan integral', cantidad: 132, ingresos: 369.60 },
    { nombre: 'Leche 1L', cantidad: 118, ingresos: 495.60 },
    { nombre: 'Papa Lay\'s', cantidad: 98, ingresos: 294.00 },
    { nombre: 'Jabón líquido', cantidad: 87, ingresos: 739.50 },
  ];
  loadingTopProductosMes = false;

  // Métodos de pago por rango
  metodosPagoRango = [
    { nombre: 'Efectivo', cantidad: 245, monto: 19600.00, porcentaje: 43.3 },
    { nombre: 'Yape', cantidad: 168, monto: 14280.00, porcentaje: 31.5 },
    { nombre: 'Plin', cantidad: 78, monto: 6240.00, porcentaje: 13.8 },
    { nombre: 'Transferencia', cantidad: 43, monto: 5160.00, porcentaje: 11.4 },
  ];
  loadingMetodosPagoRango = false;

  // Categorías más vendidas por mes
  categoriasMes = [
    { nombre: 'Bebidas', cantidad: 312, ingresos: 12480.00 },
    { nombre: 'Snacks', cantidad: 245, ingresos: 7350.00 },
    { nombre: 'Lácteos', cantidad: 198, ingresos: 7920.00 },
    { nombre: 'Panadería', cantidad: 167, ingresos: 5010.00 },
    { nombre: 'Limpieza', cantidad: 134, ingresos: 8040.00 },
    { nombre: 'Higiene', cantidad: 112, ingresos: 5600.00 },
  ];
  loadingTopCategoriasMes = false;

  ngOnInit(): void {
    // Suscribirse al reporte mensual
    this.store.select(selectReporteMensual)
      .pipe(takeUntil(this.destroy$))
      .subscribe(reporte => {
        if (reporte) {
          this.resumenVentas = {
            totalVentas: reporte.total_ventas,
            totalTransacciones: reporte.num_comprobantes,
            ticketPromedio: reporte.num_comprobantes > 0 ? reporte.total_ventas / reporte.num_comprobantes : 0,
            clientesAtendidos: reporte.clientes_atendidos,
            vsMesAnterior: reporte.porcentaje_vs_mes_anterior,
          };
        }
      });

    // Suscribirse al loading
    this.store.select(selectLoadingReporteMensual)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingReporteMensual = loading);

    // Suscribirse a métodos de pago por rango
    this.store.select(selectMetodosPagoRango)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data && data.metodos_pago.length > 0) {
          this.metodosPagoRango = data.metodos_pago.map(m => ({
            nombre: m.metodo_pago,
            cantidad: m.num_ventas,
            monto: m.total_soles,
            porcentaje: m.porcentaje
          }));
        }
      });

    // Suscribirse al loading de métodos de pago
    this.store.select(selectLoadingMetodosPagoRango)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingMetodosPagoRango = loading);

    // Suscribirse a top productos del mes
    this.store.select(selectTopProductosMes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data && data.productos.length > 0) {
          this.topProductosMes = data.productos.map(p => ({
            nombre: p.nombre,
            cantidad: p.total_unidades,
            ingresos: p.total_ingresos
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
            ingresos: c.total_ingresos
          }));
        }
      });

    // Suscribirse al loading de top categorías
    this.store.select(selectLoadingTopCategoriasMes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingTopCategoriasMes = loading);

    // Cargar reporte del mes actual
    this.loadReporteMensual();

    // Cargar métodos de pago por rango
    this.loadMetodosPagoRango();

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
    const monthIndex = this.monthNames.indexOf(this.selectedMonth);
    this.store.dispatch(cargarReporteMensual({ month: monthIndex, year: this.selectedYear }));
  }

  loadMetodosPagoRango(): void {
    const startMonthIndex = this.monthNames.indexOf(this.rangeStartMonth) + 1;
    const endMonthIndex = this.monthNames.indexOf(this.rangeEndMonth) + 1;
    const fromDate: [number, number, number] = [this.rangeStartDay, startMonthIndex, this.rangeStartYear];
    const toDate: [number, number, number] = [this.rangeEndDay, endMonthIndex, this.rangeEndYear];
    this.store.dispatch(cargarMetodosPagoRango({ fromDate, toDate }));
  }

  loadTopProductosMes(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonth);
    this.store.dispatch(cargarTopProductosMes({ month: monthIndex, year: this.selectedYear }));
  }

  loadTopCategoriasMes(): void {
    const monthIndex = this.monthNames.indexOf(this.selectedMonth);
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

  onRangeChange(): void {
    this.loadMetodosPagoRango();
  }

  getEmpleadoBarHeight(ventas: number): number {
    return 0;
  }

  getComparisonClass(value: number): string {
    return value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  getMargenClass(margen: number): string {
    if (margen >= 50) return 'text-emerald-600 dark:text-emerald-400';
    if (margen >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }
}
