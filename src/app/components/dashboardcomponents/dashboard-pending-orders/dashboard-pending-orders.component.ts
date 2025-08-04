import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TuiLegendItem, TuiPieChart } from '@taiga-ui/addon-charts';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiHint } from '@taiga-ui/core';
@Component({
  selector: 'app-dashboard-pending-orders',
  standalone: true,
  imports: [AsyncPipe, TuiAmountPipe, TuiHint, TuiPieChart, TuiLegendItem, TuiHovered],
  templateUrl: './dashboard-pending-orders.component.html',
  styleUrl: './dashboard-pending-orders.component.scss'
})
export class DashboardPendingOrdersComponent {
  protected readonly value = [13769, 12367, 10172, 3018, 2592];
  protected readonly labels = ['Food', 'Cafe', 'Open Source', 'Taxi', 'Other'];
  protected activeItemIndex = NaN;

  protected isItemActive(index: number): boolean {
    return this.activeItemIndex === index;
  }

  protected onHover(index: number, hovered: boolean): void {
    this.activeItemIndex = hovered ? index : NaN;
  }
}
