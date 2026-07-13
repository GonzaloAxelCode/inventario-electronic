import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiPieChart, TuiRingChart, TuiLegendItem } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';

@Component({
  selector: 'app-graficos-productos',
  standalone: true,
  imports: [
    CommonModule,
    TuiRingChart,
    TuiPieChart,
    TuiLegendItem,
    TuiHovered,
  ],
  templateUrl: './graficos-productos.component.html',
  styleUrl: './graficos-productos.component.scss'
})
export class GraficosProductosComponent {

  // ====== 1. Ring Chart: Productos más vendidos ======
  ringValue = [45, 32, 28, 18, 12];
  ringLabels = ['Laptop HP', 'Mouse Logitech', 'Teclado Mech', 'Monitor LG', 'Audífonos'];
  ringActiveIndex = NaN;

  // ====== 2. Pie Chart: Distribución por categoría ======
  pieValue = [35, 25, 20, 12, 8];
  pieLabels = ['Electrónica', 'Accesorios', 'Periféricos', 'Almacenamiento', 'Redes'];
  pieActiveIndex = NaN;

  // ====== 3. Barras verticales: Ventas por mes ======
  barData = [
    { label: 'Ene', value: 120 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 180 },
    { label: 'Abr', value: 90 },
    { label: 'May', value: 200 },
    { label: 'Jun', value: 170 },
  ];
  barMax = Math.max(...this.barData.map(d => d.value));

  // ====== 4. Linea de tendencia: Ventas diarias ======
  lineData = [
    { day: '01', value: 12 },
    { day: '03', value: 18 },
    { day: '05', value: 15 },
    { day: '07', value: 22 },
    { day: '09', value: 19 },
    { day: '11', value: 25 },
    { day: '13', value: 20 },
    { day: '15', value: 28 },
    { day: '17', value: 24 },
    { day: '19', value: 30 },
    { day: '21', value: 26 },
    { day: '23', value: 32 },
    { day: '25', value: 29 },
    { day: '27', value: 35 },
    { day: '29', value: 31 },
  ];
  lineMax = Math.max(...this.lineData.map(d => d.value));
  lineMin = Math.min(...this.lineData.map(d => d.value));

  // ====== 5. Barras horizontales: Top productos por ingresos ======
  horizontalData = [
    { nombre: 'Laptop HP', ingresos: 15800 },
    { nombre: 'Monitor LG', ingresos: 12400 },
    { nombre: 'Teclado Mech', ingresos: 8900 },
    { nombre: 'Mouse Logitech', ingresos: 6200 },
    { nombre: 'Audífonos', ingresos: 4500 },
  ];
  horizontalMax = Math.max(...this.horizontalData.map(d => d.ingresos));

  // Métodos para Ring Chart
  isRingActive(index: number): boolean {
    return this.ringActiveIndex === index;
  }

  onRingHover(index: number, hovered: boolean): void {
    this.ringActiveIndex = hovered ? index : NaN;
  }

  // Métodos para Pie Chart
  isPieActive(index: number): boolean {
    return this.pieActiveIndex === index;
  }

  onPieHover(index: number, hovered: boolean): void {
    this.pieActiveIndex = hovered ? index : NaN;
  }

  // Calcular puntos para la línea SVG
  getLinePath(): string {
    const width = 100;
    const height = 60;
    const padding = 5;

    return this.lineData.map((point, i) => {
      const x = padding + (i / (this.lineData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.value - this.lineMin) / (this.lineMax - this.lineMin)) * (height - padding * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  getLinePoints(): { x: number; y: number }[] {
    const width = 100;
    const height = 60;
    const padding = 5;

    return this.lineData.map((point, i) => ({
      x: padding + (i / (this.lineData.length - 1)) * (width - padding * 2),
      y: height - padding - ((point.value - this.lineMin) / (this.lineMax - this.lineMin)) * (height - padding * 2),
    }));
  }
}
