import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { selectInventarioState } from '@/app/state/selectors/inventario.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiLegendItem, TuiPieChart, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiFormatNumberPipe } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { Observable, map } from 'rxjs';

interface LowStockProduct {
  item: { nombre: string };
  inventario: {
    cantidad: number;
    stock_minimo: number;
    stock_maximo: number;
    producto_nombre?: string;
    categoria_nombre?: string;
  };
}

@Component({
  selector: 'app-alertas-stock',
  standalone: true,
  imports: [
    CommonModule,
    TuiTable,
    TuiFormatNumberPipe,
    TuiSkeleton,
    TuiRingChart,
    TuiPieChart,
    TuiLegendItem,
    TuiHovered,
  ],
  templateUrl: './alertas-stock.component.html',
  styleUrl: './alertas-stock.component.scss'
})
export class AlertasStockComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  selectInventario$!: Observable<InventarioState>;

  lowStockProducts: LowStockProduct[] = [];

  // Stats
  totalBajoStock = 0;
  critico = 0;    // 0-3 unidades
  advertencia = 0; // 4-10 unidades

  // Ring Chart: Distribución por estado
  ringValue = [0, 0];
  ringLabels = ['Crítico (0-3)', 'Advertencia (4-10)'];
  ringActiveIndex = NaN;

  // Pie Chart: Distribución por categoría
  pieValue: number[] = [];
  pieLabels: string[] = [];
  pieActiveIndex = NaN;

  // Bar chart: Productos por nivel de stock
  stockLevels = [
    { label: '0-3', count: 0, color: '#EF4444' },
    { label: '4-6', count: 0, color: '#F97316' },
    { label: '7-10', count: 0, color: '#F59E0B' },
  ];

  constructor() {}

  ngOnInit() {
    this.selectInventario$ = this.store.select(selectInventarioState);
    this.store.select(selectInventarioState).subscribe((state) => {
      const products = (state.lowStockProducts || []) as LowStockProduct[];
      this.lowStockProducts = products;

      // Calcular estadísticas
      this.critico = products.filter(p => p.inventario.cantidad <= 3).length;
      this.advertencia = products.filter(p => p.inventario.cantidad > 3 && p.inventario.cantidad <= 10).length;
      this.totalBajoStock = products.length;

      // Ring chart data
      this.ringValue = [this.critico, this.advertencia];

      // Pie chart: distribución por categoría
      const categoriaMap = new Map<string, number>();
      products.forEach(p => {
        const cat = p.inventario.categoria_nombre || 'Sin categoría';
        categoriaMap.set(cat, (categoriaMap.get(cat) || 0) + 1);
      });
      this.pieLabels = Array.from(categoriaMap.keys());
      this.pieValue = Array.from(categoriaMap.values());

      // Stock levels for bar chart
      this.stockLevels[0].count = products.filter(p => p.inventario.cantidad <= 3).length;
      this.stockLevels[1].count = products.filter(p => p.inventario.cantidad > 3 && p.inventario.cantidad <= 6).length;
      this.stockLevels[2].count = products.filter(p => p.inventario.cantidad > 6 && p.inventario.cantidad <= 10).length;
    });
  }

  getColorClass(cantidad: number): string {
    if (cantidad >= 0 && cantidad <= 3) {
      return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    } else if (cantidad >= 4 && cantidad <= 10) {
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
    return 'text-green-500 bg-green-50 dark:bg-green-900/20';
  }

  getBarHeight(cantidad: number): number {
    if (cantidad <= 3) return 100;
    if (cantidad <= 6) return 65;
    return 35;
  }

  // Ring Chart methods
  isRingActive(index: number): boolean {
    return this.ringActiveIndex === index;
  }

  onRingHover(index: number, hovered: boolean): void {
    this.ringActiveIndex = hovered ? index : NaN;
  }

  // Pie Chart methods
  isPieActive(index: number): boolean {
    return this.pieActiveIndex === index;
  }

  onPieHover(index: number, hovered: boolean): void {
    this.pieActiveIndex = hovered ? index : NaN;
  }
}
