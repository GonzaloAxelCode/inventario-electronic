import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-dashboard-general-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-general-stats.component.html',
  styleUrl: './dashboard-general-stats.component.scss'
})
export class DashboardGeneralStatsComponent {

  monthNames = MONTH_NAMES;
  currentYear = new Date().getFullYear();
  yearNumbers = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  dayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

  // Selectores por sección
  // Secciones de MES: Resumen ventas, Compras, Top productos, Categorías, Tendencia semanal
  selectedMonth = MONTH_NAMES[new Date().getMonth()];
  selectedYear = this.currentYear;

  // Secciones de RANGO: Métodos de pago, Rendimiento por empleado
  rangeStartDay = 1;
  rangeStartMonth = MONTH_NAMES[new Date().getMonth()];
  rangeStartYear = this.currentYear;
  rangeEndDay = new Date().getDate();
  rangeEndMonth = MONTH_NAMES[new Date().getMonth()];
  rangeEndYear = this.currentYear;

  // Sección de COMPARATIVA: Dos meses
  compMonthA = MONTH_NAMES[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1];
  compYearA = new Date().getMonth() === 0 ? this.currentYear - 1 : this.currentYear;
  compMonthB = MONTH_NAMES[new Date().getMonth()];
  compYearB = this.currentYear;

  // 1. Resumen de ventas por mes
  resumenVentas = {
    totalVentas: 45280.00,
    totalTransacciones: 534,
    ticketPromedio: 84.80,
    clientesAtendidos: 412,
    vsMesAnterior: 8.3,
  };

  // 2. Compras del mes
  comprasMes = [
    { proveedor: 'Distribuidora Lima SAC', total: 12500.00, items: 45, fecha: '05/08/2026' },
    { proveedor: 'Mayorista Central', total: 8900.00, items: 32, fecha: '12/08/2026' },
    { proveedor: 'Importaciones Fast', total: 5600.00, items: 18, fecha: '20/08/2026' },
  ];
  totalComprasMes = 27000.00;

  // 3. Top productos por mes
  topProductosMes = [
    { nombre: 'Gaseosa 600ml', cantidad: 156, ingresos: 546.00 },
    { nombre: 'Pan integral', cantidad: 132, ingresos: 369.60 },
    { nombre: 'Leche 1L', cantidad: 118, ingresos: 495.60 },
    { nombre: 'Papa Lay\'s', cantidad: 98, ingresos: 294.00 },
    { nombre: 'Jabón líquido', cantidad: 87, ingresos: 739.50 },
  ];

  // 4. Métodos de pago por rango
  metodosPagoRango = [
    { nombre: 'Efectivo', cantidad: 245, monto: 19600.00, porcentaje: 43.3 },
    { nombre: 'Yape', cantidad: 168, monto: 14280.00, porcentaje: 31.5 },
    { nombre: 'Plin', cantidad: 78, monto: 6240.00, porcentaje: 13.8 },
    { nombre: 'Transferencia', cantidad: 43, monto: 5160.00, porcentaje: 11.4 },
  ];

  // 5. Rendimiento por empleado por rango
  empleados = [
    { nombre: 'María López', ventas: 145, total: 12890.00, color: '#8B5CF6' },
    { nombre: 'Carlos Ruiz', ventas: 132, total: 11540.00, color: '#3B82F6' },
    { nombre: 'Ana García', ventas: 118, total: 10230.00, color: '#10B981' },
    { nombre: 'Luis Torres', ventas: 98, total: 8420.00, color: '#F59E0B' },
  ];
  maxEmpleadoVentas = 145;

  // 6. Categorías más vendidas por mes
  categoriasMes = [
    { nombre: 'Bebidas', cantidad: 312, ingresos: 12480.00, margen: 45 },
    { nombre: 'Snacks', cantidad: 245, ingresos: 7350.00, margen: 52 },
    { nombre: 'Lácteos', cantidad: 198, ingresos: 7920.00, margen: 38 },
    { nombre: 'Panadería', cantidad: 167, ingresos: 5010.00, margen: 55 },
    { nombre: 'Limpieza', cantidad: 134, ingresos: 8040.00, margen: 42 },
    { nombre: 'Higiene', cantidad: 112, ingresos: 5600.00, margen: 48 },
  ];

  // 7. Comparativa de dos meses
  mesA = { nombre: 'Julio', ventas: 41800.00, transacciones: 498, ticket: 83.94 };
  mesB = { nombre: 'Agosto', ventas: 45280.00, transacciones: 534, ticket: 84.80 };

  // Handlers de cambio
  onMonthChange(): void {
    // this.store.dispatch(...)
  }

  onYearChange(): void {
    // this.store.dispatch(...)
  }

  onRangeChange(): void {
    // this.store.dispatch(...)
  }

  onCompMonthChange(): void {
    // this.store.dispatch(...)
  }

  getEmpleadoBarHeight(ventas: number): number {
    return this.maxEmpleadoVentas > 0 ? (ventas / this.maxEmpleadoVentas) * 100 : 0;
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
