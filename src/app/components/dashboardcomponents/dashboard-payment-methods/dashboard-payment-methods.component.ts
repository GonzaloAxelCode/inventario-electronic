import { MetodoPagoResponse, VentaService } from '@/app/services/venta.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiFormatNumberPipe } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSkeleton } from '@taiga-ui/kit';
import { TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-payment-methods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiRingChart,
    TuiLegendItem,
    TuiHovered,
    TuiSkeleton,
    TuiFormatNumberPipe,
    TuiDataListWrapper,
    TuiSelectModule,
    TuiTextfieldControllerModule,
  ],
  templateUrl: './dashboard-payment-methods.component.html',
  styleUrl: './dashboard-payment-methods.component.scss',
})
export class DashboardPaymentMethodsComponent implements OnInit {
  private readonly ventaService = inject(VentaService);

  loading = true;
  totalVentas = 0;

  ringValue: number[] = [];
  ringLabels: string[] = [];
  ringColors: string[] = ['#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899'];
  activeItemIndex = NaN;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedMonthName: string = '';
  selectedYear: number = new Date().getFullYear();

  months = [
    { number: 1, name: 'Enero' },
    { number: 2, name: 'Febrero' },
    { number: 3, name: 'Marzo' },
    { number: 4, name: 'Abril' },
    { number: 5, name: 'Mayo' },
    { number: 6, name: 'Junio' },
    { number: 7, name: 'Julio' },
    { number: 8, name: 'Agosto' },
    { number: 9, name: 'Septiembre' },
    { number: 10, name: 'Octubre' },
    { number: 11, name: 'Noviembre' },
    { number: 12, name: 'Diciembre' },
  ];

  years = [
    { number: 2025 },
    { number: 2026 },
    { number: 2027 },
  ];

  monthNames: string[] = [];
  yearNumbers: number[] = [];

  ngOnInit(): void {
    this.monthNames = this.months.map(m => m.name);
    this.yearNumbers = this.years.map(y => y.number);
    this.selectedMonthName = this.months.find(m => m.number === this.selectedMonth)?.name || '';
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.ventaService.getMetodosPago(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.totalVentas = data.total_ventas;
        this.ringLabels = data.metodos_pago.map((m) => m.metodo_pago);
        this.ringValue = data.metodos_pago.map((m) => m.cantidad);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onMonthChange(monthName: string): void {
    const month = this.months.find((m) => m.name === monthName);
    if (month) {
      this.selectedMonth = month.number;
      this.selectedMonthName = month.name;
      this.loadData();
    }
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadData();
  }

  isRingActive(index: number): boolean {
    return this.activeItemIndex === index;
  }

  onRingHover(index: number, hovered: boolean): void {
    this.activeItemIndex = hovered ? index : NaN;
  }

  getColor(index: number): string {
    return this.ringColors[index % this.ringColors.length];
  }
}
