import { ChartsalesbetweentwodatesComponent } from '@/app/components/dashboardcomponents/chartsalesbetweentwodates/chartsalesbetweentwodates.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton } from '@taiga-ui/core';
import { TuiSegmented } from '@taiga-ui/kit';
import { TuiCardMedium } from '@taiga-ui/layout';
import { DashboardLowStockComponent } from "../../components/dashboardcomponents/dashboard-low-stock/dashboard-low-stock.component";
import { DashboardPendingOrdersComponent } from "../../components/dashboardcomponents/dashboard-pending-orders/dashboard-pending-orders.component";
import { DashboardProductsMostSalesComponent } from "../../components/dashboardcomponents/dashboard-products-most-sales/dashboard-products-most-sales.component";
import { DashboardSalesCardsComponent } from "../../components/dashboardcomponents/dashboard-sales-cards/dashboard-sales-cards.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartsalesbetweentwodatesComponent, DashboardSalesCardsComponent, DashboardLowStockComponent, CommonModule, TuiButton, TuiAppearance, TuiTable, TuiSegmented, TuiCardMedium, DashboardProductsMostSalesComponent, DashboardLowStockComponent, DashboardSalesCardsComponent, DashboardPendingOrdersComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
