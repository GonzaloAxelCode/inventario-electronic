import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@/app/state/app.state';
import { loadPorcentajeCategoria } from '@/app/state/actions/categoria.actions';
import { selectPorcentajeCategoria, selectLoadingPorcentaje } from '@/app/state/selectors/categoria.selectors';
import { loadTopProductosCompra, loadValorCategoria } from '@/app/state/actions/inventario.actions';
import { selectTopProductosCompra, selectLoadingTopProductosCompra, selectValorCategoria, selectLoadingValorCategoria } from '@/app/state/selectors/inventario.selectors';

@Component({
  selector: 'app-graficos-productos',
  standalone: true,
  imports: [
    CommonModule,
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

  // ====== 2. Top 10 accesorios por costo de compra (tabla) ======
  topProductos: { producto: string; sku: string; categoria: string; cantidad: number; costoCompra: number; costoVenta: number }[] = [];
  loadingTopProductos = true;
  tipoTop: 'compra' | 'venta' = 'compra';

  // ====== 3. Valor total en soles por categoría (tabla) ======
  valorCategoria: { categoria: string; cantidadProductos: number; totalUnidades: number; valorTotal: number }[] = [];
  loadingValorCategoria = true;
  tipoValor: 'compra' | 'venta' = 'compra';

  ngOnInit(): void {
    this.store.dispatch(loadPorcentajeCategoria());
    this.recargarTop();
    this.recargarValor();

    this.store.select(selectPorcentajeCategoria).subscribe(porcentajes => {
      this.pieLabels = porcentajes.map(p => p.categoria);
      this.pieValue = porcentajes.map(p => p.porcentaje);
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingPorcentaje).subscribe(loading => {
      this.loadingCategoria = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectTopProductosCompra).subscribe(productos => {
      this.topProductos = (productos ?? []).map(p => ({
        producto: p.producto,
        sku: p.sku,
        categoria: p.categoria,
        cantidad: p.cantidad,
        costoCompra: p.costo_compra,
        costoVenta: p.costo_venta
      }));
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingTopProductosCompra).subscribe(loading => {
      this.loadingTopProductos = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectValorCategoria).subscribe(valores => {
      this.valorCategoria = (valores ?? []).map(v => ({
        categoria: v.categoria,
        cantidadProductos: v.cantidad_productos,
        totalUnidades: v.total_unidades,
        valorTotal: v.valor_total
      }));
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingValorCategoria).subscribe(loading => {
      this.loadingValorCategoria = loading;
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

  recargarTop(): void {
    this.store.dispatch(loadTopProductosCompra({ tipo: this.tipoTop }));
  }

  recargarValor(): void {
    this.store.dispatch(loadValorCategoria({ tipo: this.tipoValor }));
  }

  onTipoTopChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value as 'compra' | 'venta';
    if (v !== this.tipoTop) {
      this.tipoTop = v;
      this.recargarTop();
    }
  }

  onTipoValorChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value as 'compra' | 'venta';
    if (v !== this.tipoValor) {
      this.tipoValor = v;
      this.recargarValor();
    }
  }

  costoMostrado(item: { costoCompra: number; costoVenta: number }): number {
    return this.tipoTop === 'venta' ? (item.costoVenta ?? 0) : (item.costoCompra ?? 0);
  }
}
