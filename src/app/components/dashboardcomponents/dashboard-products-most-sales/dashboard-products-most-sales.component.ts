import { cargarTopProductosVentas } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, NgForOf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiLegendItem, TuiRingChart } from '@taiga-ui/addon-charts';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiHovered } from '@taiga-ui/cdk';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-dashboard-products-most-sales',
  standalone: true,

  imports: [AsyncPipe, NgForOf, TuiAmountPipe, TuiHovered, TuiLegendItem, TuiRingChart],

  templateUrl: './dashboard-products-most-sales.component.html',
  styleUrl: './dashboard-products-most-sales.component.scss'
})
export class DashboardProductsMostSalesComponent implements OnInit {
  private readonly store = inject(Store<AppState>);

  // Variables para el gráfico de anillo
  protected activeItemIndex = NaN;
  protected value: number[] = [];  // Para las cantidades vendidas
  protected labels: string[] = [];  // Para los nombres de los productos
  protected topProductosMasVendidos$: Observable<any>;

  constructor() {
    // Inicializamos el observable para obtener los productos más vendidos
    this.topProductosMasVendidos$ = this.store.select(selectVenta);
  }

  ngOnInit() {
    const tiendaId = 1; // Reemplaza con el valor dinámico si es necesario
    const fromDate = new Date(2025, 0, 1); // Enero 1, 2025
    const toDate = new Date(2025, 4, 4); // Abril 4, 2025

    // Despachamos la acción para cargar los productos más vendidos
    this.store.dispatch(cargarTopProductosVentas({ tiendaId, fromDate, toDate }));

    // Suscribimos a la respuesta de los productos más vendidos
    this.topProductosMasVendidos$.subscribe((productos) => {
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
