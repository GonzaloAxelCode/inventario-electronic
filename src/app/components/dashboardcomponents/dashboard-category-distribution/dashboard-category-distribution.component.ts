import { PorcentajeCategoria } from '@/app/models/categoria.models';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiLegendItem, TuiPieChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiFormatNumberPipe } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { AppState } from '@/app/state/app.state';
import { loadPorcentajeCategoria } from '@/app/state/actions/categoria.actions';
import { selectPorcentajeCategoria, selectLoadingPorcentaje } from '@/app/state/selectors/categoria.selectors';

@Component({
  selector: 'app-dashboard-category-distribution',
  standalone: true,
  imports: [
    CommonModule,
    TuiPieChart,
    TuiLegendItem,
    TuiHovered,
    TuiSkeleton,
    TuiFormatNumberPipe,
  ],
  templateUrl: './dashboard-category-distribution.component.html',
  styleUrl: './dashboard-category-distribution.component.scss',
})
export class DashboardCategoryDistributionComponent implements OnInit {
  private readonly store = inject(Store<AppState>);

  loading = true;
  porcentajes: PorcentajeCategoria[] = [];

  pieValue: number[] = [];
  pieLabels: string[] = [];
  pieColors: string[] = [
    '#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  activeItemIndex = NaN;

  ngOnInit(): void {
    this.store.dispatch(loadPorcentajeCategoria());

    this.store.select(selectPorcentajeCategoria).subscribe(porcentajes => {
      this.porcentajes = porcentajes;
      this.pieLabels = porcentajes.map(p => p.categoria);
      this.pieValue = porcentajes.map(p => p.porcentaje);
    });

    this.store.select(selectLoadingPorcentaje).subscribe(loading => {
      this.loading = loading;
    });
  }

  isPieActive(index: number): boolean {
    return this.activeItemIndex === index;
  }

  onPieHover(index: number, hovered: boolean): void {
    this.activeItemIndex = hovered ? index : NaN;
  }

  getColor(index: number): string {
    return this.pieColors[index % this.pieColors.length];
  }
}
