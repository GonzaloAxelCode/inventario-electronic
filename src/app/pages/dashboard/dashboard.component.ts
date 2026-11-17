import { ChartsalesbetweentwodatesComponent } from '@/app/components/dashboardcomponents/chartsalesbetweentwodates/chartsalesbetweentwodates.component';
import { tienePermiso } from '@/app/models/permissions.catalog';
import { DashboardGeneralStatsComponent } from "@/app/components/dashboardcomponents/dashboard-general-stats/dashboard-general-stats.component";
import { GraficosInicioComponent } from "@/app/components/dashboardcomponents/graficos-inicio/graficos-inicio.component";
import { ReportExportCardsComponent } from "@/app/components/dashboardcomponents/report-export-cards/report-export-cards.component";
import { AlertasStockComponent } from "@/app/components/productoscomponents/alertas-stock/alertas-stock.component";
import { GraficosProductosComponent } from "@/app/components/productoscomponents/graficos-productos/graficos-productos.component";
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
    DashboardGeneralStatsComponent,
    GraficosInicioComponent,
    ReportExportCardsComponent,
    AlertasStockComponent,
    GraficosProductosComponent,
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

  validTabs = ['general', 'ventas', 'inventario', 'reportes'] as const;
  activeTab: 'general' | 'ventas' | 'inventario' | 'reportes' = 'general';
  activeTabIndex = 0;

  statSections = [
    { id: 'general' as const, label: 'General', desc: 'Resumen de la tienda', icon: '@tui.layout-dashboard', perm: 'view_stats_general' },
    { id: 'ventas' as const, label: 'Ventas', desc: 'Día, rango y top', icon: '@tui.shopping-cart', perm: 'view_stats_ventas' },
    { id: 'inventario' as const, label: 'Inventario', desc: 'Stock y gráficos', icon: '@tui.package', perm: 'view_stats_inventario' },
    { id: 'reportes' as const, label: 'Exportar Datos', desc: 'Excel de inventario, ventas y ganancias', icon: '@tui.chart-column', perm: 'can_export_data' },
  ];
  tiene = tienePermiso;

  puedeVer(id: string): boolean {
    const item = this.statSections.find((s) => s.id === id);
    if (!item) return false;
    // Exportar Datos: vale con exportar o con respaldar (el dueño pasa siempre).
    if (item.id === 'reportes') {
      return tienePermiso(this.user as any, 'can_export_data')
        || tienePermiso(this.user as any, 'can_make_backup');
    }
    return tienePermiso(this.user as any, (item as any).perm);
  }

  onSectionChangeById(id: string): void {
    const idx = this.validTabs.indexOf(id as any);
    if (idx >= 0) this.onTabChange(idx);
  }

  onSectionChange(index: number) {
    this.onTabChange(index);
  }

  ngOnInit() {
    this.store.select(selectUsersState).subscribe(userState => {
      this.user = userState.user;
      this.tiendaNombre = this.user?.tienda_nombre || 'Mi Tienda';
      this.ajustarTabVisible();
    });

    this.route.fragment.subscribe((fragment) => {
      // Compat con tabs antiguos: resumen -> ventas, comparacion -> reportes
      const mapped = fragment === 'resumen' ? 'ventas' : fragment === 'comparacion' ? 'reportes' : fragment;
      if (mapped && this.isValidTab(mapped) && this.puedeVer(mapped)) {
        this.activeTab = mapped as typeof this.activeTab;
        this.activeTabIndex = this.validTabs.indexOf(mapped as any);
      } else {
        this.irPrimerTabVisible();
      }
      this.cdr.markForCheck();
    });
  }

  private ajustarTabVisible(): void {
    if (!this.puedeVer(this.activeTab)) this.irPrimerTabVisible(false);
  }

  private irPrimerTabVisible(actualizarUrl = true): void {
    const primero = this.statSections.find((s) => this.puedeVer(s.id));
    if (primero) {
      this.activeTab = primero.id as typeof this.activeTab;
      this.activeTabIndex = this.validTabs.indexOf(primero.id as any);
      if (actualizarUrl) this.location.replaceState(`/app#${primero.id}`);
    }
    this.cdr.markForCheck();
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
