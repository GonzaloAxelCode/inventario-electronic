import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { finalize } from 'rxjs';
import { ReportExportService, ResumenAnual } from '@/app/services/report-export.service';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';

@Component({
  selector: 'app-annual-best-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annual-best-cards.component.html',
  styleUrl: './annual-best-cards.component.scss',
})
export class AnnualBestCardsComponent implements OnInit {
  private readonly exportService = inject(ReportExportService);
  private readonly store = inject(Store<AppState>);

  perms$ = this.store.select(selectCurrenttUser).pipe(map((u) => u?.permissions));

  currentYear = new Date().getFullYear();
  years = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  year = this.currentYear;

  loading = true;
  data: ResumenAnual | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  onYearChange(y: number): void {
    this.year = +y;
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.exportService.getResumenAnual(this.year)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (d) => (this.data = d),
        error: () => (this.data = null),
      });
  }
}
