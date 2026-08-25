import { ChartsalesbetweentwodatesComponent } from '@/app/components/dashboardcomponents/chartsalesbetweentwodates/chartsalesbetweentwodates.component';
import { DashboardDailySummaryComponent } from "@/app/components/dashboardcomponents/dashboard-daily-summary/dashboard-daily-summary.component";
import { DashboardGeneralStatsComponent } from "@/app/components/dashboardcomponents/dashboard-general-stats/dashboard-general-stats.component";
import { DashboardProductsMostSalesComponent } from "@/app/components/dashboardcomponents/dashboard-products-most-sales/dashboard-products-most-sales.component";
import { GraficosInicioComponent } from "@/app/components/dashboardcomponents/graficos-inicio/graficos-inicio.component";
import { AlertasStockComponent } from "@/app/components/productoscomponents/alertas-stock/alertas-stock.component";
import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiFade, TuiSegmented, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiCardMedium, TuiNavigation } from '@taiga-ui/layout';
import { DashboardSalesCardsComponent } from "../../components/dashboardcomponents/dashboard-sales-cards/dashboard-sales-cards.component";
import { Store } from '@ngrx/store';
import { AppState } from '@/app/state/app.state';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { User } from '@/app/models/user.models';
import { initialStateUser } from '@/app/state/reducers/user.reducer';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartsalesbetweentwodatesComponent,
    DashboardSalesCardsComponent,
    DashboardDailySummaryComponent,
    DashboardGeneralStatsComponent,
    DashboardProductsMostSalesComponent,
    GraficosInicioComponent,
    AlertasStockComponent,
    TuiButton, TuiAppearance, TuiTable, TuiSegmented,
    TuiCardMedium, TuiFade, TuiTab, TuiTabs, TuiNavigation, TuiIcon
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store<AppState>);

  user: User = initialStateUser.user;
  tiendaNombre = '';

  validTabs = ['general', 'resumen', 'inventario', 'comparacion'] as const;
  activeTab: 'general' | 'resumen' | 'inventario' | 'comparacion' = 'general';
  activeTabIndex = 0;

  ngOnInit() {
    this.store.select(selectUsersState).subscribe(userState => {
      this.user = userState.user;
      this.tiendaNombre = this.user.tienda_nombre || 'Mi Tienda';
    });

    this.route.fragment.subscribe((fragment) => {
      if (fragment && this.isValidTab(fragment)) {
        this.activeTab = fragment as typeof this.activeTab;
        this.activeTabIndex = this.validTabs.indexOf(fragment as any);
        this.cdr.markForCheck();
      }
    });
  }

  onTabChange(index: number) {
    const tab = this.validTabs[index];
    this.activeTab = tab;
    this.activeTabIndex = index;
    this.location.replaceState(`/app#${tab}`);
  }

  private isValidTab(tab: string): boolean {
    return (this.validTabs as readonly string[]).includes(tab);
  }
}
