import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiPieChart, TuiLegendItem } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';

@Component({
  selector: 'app-graficos-productos',
  standalone: true,
  imports: [
    CommonModule,
    TuiPieChart,
    TuiLegendItem,
    TuiHovered,
  ],
  templateUrl: './graficos-productos.component.html',
  styleUrl: './graficos-productos.component.scss'
})
export class GraficosProductosComponent {

  // ====== 1. Pie Chart: Distribución por categoría ======
  pieValue = [35, 25, 20, 12, 8];
  pieLabels = ['Electrónica', 'Accesorios', 'Periféricos', 'Almacenamiento', 'Redes'];
  pieActiveIndex = NaN;

  // ====== 2. Top Productos en Inventario por costo de Compra ======
  inventarioData = [
    { nombre: 'Laptop HP', unidades: 12, costoUnitario: 2800, costoTotal: 33600 },
    { nombre: 'Monitor LG 24"', unidades: 8, costoUnitario: 1550, costoTotal: 12400 },
    { nombre: 'Teclado Mecánico', unidades: 25, costoUnitario: 356, costoTotal: 8900 },
    { nombre: 'Mouse Logitech', unidades: 40, costoUnitario: 155, costoTotal: 6200 },
    { nombre: 'Audífonos Bluetooth', unidades: 30, costoUnitario: 150, costoTotal: 4500 },
  ];
  inventarioMax = Math.max(...this.inventarioData.map(d => d.costoTotal));

  // ====== 3. Estado del Stock (Dona) ======
  stockStatusValue = [45, 28, 15, 12];
  stockStatusLabels = ['Normal', 'Bajo', 'Crítico', 'Sin Stock'];
  stockStatusActiveIndex = NaN;

  // ====== 4. Productos por Rango de Precio ======
  precioRangos = [
    { rango: 'S/ 0 - 50', cantidad: 120, color: '#10B981' },
    { rango: 'S/ 50 - 150', cantidad: 85, color: '#3B82F6' },
    { rango: 'S/ 150 - 500', cantidad: 52, color: '#8B5CF6' },
    { rango: 'S/ 500 - 1000', cantidad: 28, color: '#F59E0B' },
    { rango: 'S/ 1000+', cantidad: 12, color: '#EF4444' },
  ];
  precioMax = 120;

  // ====== 5. Valorización del Inventario por Categoría ======
  valorizacion = [
    { nombre: 'Electrónica', valorTotal: 125000, productos: 45 },
    { nombre: 'Accesorios', valorTotal: 42000, productos: 80 },
    { nombre: 'Periféricos', valorTotal: 38500, productos: 65 },
    { nombre: 'Almacenamiento', valorTotal: 22000, productos: 35 },
    { nombre: 'Redes', valorTotal: 15500, productos: 22 },
  ];
  valorizacionMax = 125000;

  // ====== 6. Productos por Estado (Dona) ======
  estadoValue = [180, 42];
  estadoLabels = ['Activos', 'Inactivos'];
  estadoActiveIndex = NaN;

  // ====== 7. Margen de Ganancia por Categoría ======
  margenes = [
    { nombre: 'Electrónica', costo: 85000, venta: 125000, margen: 32 },
    { nombre: 'Accesorios', costo: 18000, venta: 42000, margen: 57 },
    { nombre: 'Periféricos', costo: 22000, venta: 38500, margen: 42.9 },
    { nombre: 'Almacenamiento', costo: 14000, venta: 22000, margen: 36.4 },
    { nombre: 'Redes', costo: 9500, venta: 15500, margen: 38.7 },
  ];
  margenMax = 57;

  // Métodos
  isPieActive(index: number): boolean {
    return this.pieActiveIndex === index;
  }

  onPieHover(index: number, hovered: boolean): void {
    this.pieActiveIndex = hovered ? index : NaN;
  }

  isStockStatusActive(index: number): boolean {
    return this.stockStatusActiveIndex === index;
  }

  onStockStatusHover(index: number, hovered: boolean): void {
    this.stockStatusActiveIndex = hovered ? index : NaN;
  }

  isEstadoActive(index: number): boolean {
    return this.estadoActiveIndex === index;
  }

  onEstadoHover(index: number, hovered: boolean): void {
    this.estadoActiveIndex = hovered ? index : NaN;
  }

  getMargenClass(margen: number): string {
    if (margen >= 50) return 'text-emerald-600 dark:text-emerald-400';
    if (margen >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }
}
