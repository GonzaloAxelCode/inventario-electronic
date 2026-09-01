import { SatisfaccionResponse, VentaService } from '@/app/services/venta.service';
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

  // Mes A (principal)
  selectedMonthA = MONTH_NAMES[new Date().getMonth()];
  selectedYearA = this.currentYear;

  // Mes B (comparación) - mes anterior por defecto
  prevMonth = new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1;
  selectedMonthB = MONTH_NAMES[this.prevMonth];
  selectedYearB = new Date().getMonth() === 0 ? this.currentYear - 1 : this.currentYear;

  // 1. Gauge - Satisfacción general
  gaugeValue = 0;
  variacion = 0;
  ventasActual = 0;
  ventasAnterior = 0;
  loadingGauge = true;

  ngOnInit(): void {
    this.loadSatisfaccion();
    this.loadTopProducts();
  }

  onMonthAChange(monthName: string): void {
    this.selectedMonthA = monthName;
    this.loadSatisfaccion();
  }

  onYearAChange(year: number): void {
    this.selectedYearA = +year;
    this.loadSatisfaccion();
  }

  onMonthBChange(monthName: string): void {
    this.selectedMonthB = monthName;
    this.loadSatisfaccion();
  }

  onYearBChange(year: number): void {
    this.selectedYearB = +year;
    this.loadSatisfaccion();
  }

  loadSatisfaccion(): void {
    this.loadingGauge = true;
    const monthA = this.monthNames.indexOf(this.selectedMonthA) + 1;
    const monthB = this.monthNames.indexOf(this.selectedMonthB) + 1;

    this.ventaService.getSatisfaccion(this.selectedYearA, monthA, this.selectedYearB, monthB).subscribe({
      next: (data) => {
        this.gaugeValue = data.porcentaje;
        this.variacion = data.variacion;
        this.ventasActual = data.mes_a.ventas;
        this.ventasAnterior = data.mes_b.ventas;
        this.loadingGauge = false;
      },
      error: () => {
        this.loadingGauge = false;
      },
    });
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
        const max = data.results.length > 0 ? Math.max(...data.results.map(r => getCantidad(r))) : 1;
        this.topProductsMax = max;
        this.topProducts = data.results.slice(0, 8).map((r: any, i: number) => ({
          name: r.nombre,
          cantidad: getCantidad(r),
          total: getTotal(r),
          value: max > 0 ? Math.round((getCantidad(r) / max) * 100) : 0,
          color: this.topProductsColors[i % this.topProductsColors.length],
        }));
        this.loadingTopProducts = false;
      },
      error: () => {
        this.topProducts = [];
        this.loadingTopProducts = false;
      },
    });
  }

  // 3. Progress circles - Objetivos
  objectives = [
    { label: 'Ventas', current: 92, target: 120, color: '#10B981' },
    { label: 'Clientes', current: 78, target: 100, color: '#3B82F6' },
    { label: 'Satisfacción', current: 87, target: 100, color: '#F59E0B' },
    { label: 'Retención', current: 65, target: 80, color: '#EF4444' },
  ];

  // 5. Top productos
  topProducts: { name: string; cantidad: number; total: number; value: number; color: string }[] = [];
  loadingTopProducts = true;
  selectedMonthTop = MONTH_NAMES[new Date().getMonth()];
  selectedYearTop = this.currentYear;
  topProductsMax = 1;
  topProductsColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

  getGaugeDash(): string {
    const circumference = 2 * Math.PI * 45;
    const safeValue = this.gaugeValue ?? 0;
    const filled = (Math.abs(safeValue) / 100) * circumference * 0.75;
    return `${filled} ${circumference}`;
  }

  getCircleProgress(current: number, target: number): string {
    const circumference = 2 * Math.PI * 36;
    const filled = (current / target) * circumference;
    return `${filled} ${circumference}`;
  }
}
