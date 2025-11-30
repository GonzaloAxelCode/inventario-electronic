import { ChartsalesbetweentwodatesComponent } from '@/app/components/dashboardcomponents/chartsalesbetweentwodates/chartsalesbetweentwodates.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton } from '@taiga-ui/core';
import { TuiSegmented } from '@taiga-ui/kit';
import { TuiCardMedium } from '@taiga-ui/layout';
import { DashboardSalesCardsComponent } from "../../components/dashboardcomponents/dashboard-sales-cards/dashboard-sales-cards.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartsalesbetweentwodatesComponent,
    DashboardSalesCardsComponent, CommonModule,
    TuiButton, TuiAppearance, TuiTable, TuiSegmented,
    TuiCardMedium, DashboardSalesCardsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
