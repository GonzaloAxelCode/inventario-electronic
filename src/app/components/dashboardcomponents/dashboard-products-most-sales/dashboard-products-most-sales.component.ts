import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, NgForOf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiSkeleton } from '@taiga-ui/kit';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-dashboard-products-most-sales',
  standalone: true,

  imports: [AsyncPipe, NgForOf, TuiAmountPipe, TuiHovered, TuiLegendItem, TuiRingChart, TuiSkeleton],

  templateUrl: './dashboard-products-most-sales.component.html',
  styleUrl: './dashboard-products-most-sales.component.scss'
})
export class DashboardProductsMostSalesComponent implements OnInit {
  private readonly store = inject(Store<AppState>);

  // Variables para el gráfico de anillo
  protected activeItemIndex = NaN;
  protected value: number[] = [];  // Para las cantidades vendidas
  protected labels: string[] = [];  // Para los nombres de los productos
  protected selectVentas$: Observable<VentaState>;

  constructor() {

    this.selectVentas$ = this.store.select(selectVenta);
  }

  ngOnInit() {


    this.selectVentas$.subscribe((productos) => {
      if (productos && productos.topProductoMostSales) {
        this.labels = productos.topProductoMostSales.map((producto: any) => producto.nombre);
        this.value = productos.topProductoMostSales.map((producto: any) => producto.cantidad_total_vendida);

      }

    });
  }

  protected isItemActive(index: number): boolean {
    return this.activeItemIndex === index;
  }

  protected onHover(index: number, hovered: boolean): void {
    this.activeItemIndex = hovered ? index : NaN;
  }
}
