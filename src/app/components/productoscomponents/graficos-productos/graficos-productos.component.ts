import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiPieChart, TuiLegendItem } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiSkeleton } from '@taiga-ui/kit';
import { AppState } from '@/app/state/app.state';
import { loadPorcentajeCategoria } from '@/app/state/actions/categoria.actions';
import { selectPorcentajeCategoria, selectLoadingPorcentaje } from '@/app/state/selectors/categoria.selectors';
import { loadDistribucionStock, loadValorizacion, loadTopCategoriasCompra } from '@/app/state/actions/inventario.actions';
import { selectDistribucionStock, selectLoadingDistribucionStock, selectValorizacion, selectLoadingValorizacion, selectTopCategoriasCompra, selectLoadingTopCategoriasCompra } from '@/app/state/selectors/inventario.selectors';

@Component({
  selector: 'app-graficos-productos',
  standalone: true,
  imports: [
    CommonModule,
    TuiPieChart,
    TuiLegendItem,
    TuiHovered,
    TuiSkeleton,
  ],
  templateUrl: './graficos-productos.component.html',
  styleUrl: './graficos-productos.component.scss'
})
export class GraficosProductosComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly cdr = inject(ChangeDetectorRef);

  // ====== 1. Pie Chart: Distribución por categoría ======
  pieValue: number[] = [];
  pieLabels: string[] = [];
  pieActiveIndex = NaN;
  loadingCategoria = true;

  // ====== 2. Top Categorias en Inventario por costo de Compra ======
  inventarioData: { nombre: string; unidades: number; costoTotal: number }[] = [];
  inventarioMax = 0;
  loadingTopCompra = true;

  // ====== 3. Estado del Stock (Dona) ======
  stockStatusValue: number[] = [];
  stockStatusLabels = ['Normal', 'Bajo', 'Crítico', 'Sin Stock'];
  stockStatusActiveIndex = NaN;
  loadingStock = true;

  // ====== 4. Productos por Rango de Precio ======
  precioRangos: { rango: string; cantidad: number; color: string }[] = [];
  precioMax = 0;
  loadingPrecioRango = true;

  // ====== 5. Valorización del Inventario por Categoría ======
  valorizacion: { nombre: string; valorTotal: number; productos: number }[] = [];
  valorizacionMax = 0;
  loadingValorizacion = true;

  ngOnInit(): void {
    this.store.dispatch(loadPorcentajeCategoria());
    this.store.dispatch(loadDistribucionStock());
    this.store.dispatch(loadValorizacion());
    this.store.dispatch(loadTopCategoriasCompra());

    this.store.select(selectPorcentajeCategoria).subscribe(porcentajes => {
      this.pieLabels = porcentajes.map(p => p.categoria);
      this.pieValue = porcentajes.map(p => p.porcentaje);
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingPorcentaje).subscribe(loading => {
      this.loadingCategoria = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectDistribucionStock).subscribe(distribucion => {
      this.stockStatusValue = [
        distribucion.normal,
        distribucion.bajo,
        distribucion.critico,
        distribucion.sin_stock
      ];
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingDistribucionStock).subscribe(loading => {
      this.loadingStock = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectValorizacion).subscribe(valorizacion => {
      this.valorizacion = valorizacion.map(v => ({
        nombre: v.categoria,
        valorTotal: v.total_compra,
        productos: v.cantidad_productos
      }));
      this.valorizacionMax = Math.max(...this.valorizacion.map(v => v.valorTotal), 1);
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingValorizacion).subscribe(loading => {
      this.loadingValorizacion = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectTopCategoriasCompra).subscribe(topCategorias => {
      this.inventarioData = topCategorias.map(c => ({
        nombre: c.categoria,
        unidades: c.total_unidades,
        costoTotal: c.total_gastado
      }));
      this.inventarioMax = Math.max(...this.inventarioData.map(d => d.costoTotal), 1);
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingTopCategoriasCompra).subscribe(loading => {
      this.loadingTopCompra = loading;
      this.cdr.markForCheck();
    });
  }

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
}
