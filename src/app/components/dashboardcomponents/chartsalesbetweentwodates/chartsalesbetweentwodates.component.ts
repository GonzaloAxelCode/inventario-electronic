import { cargarVentasRangoFechasTienda } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVentaState } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAxes, TuiLineDaysChart } from '@taiga-ui/addon-charts';
import type { TuiDayLike, TuiStringHandler } from '@taiga-ui/cdk';
import { TuiDay, TuiDayRange, TuiMonth, tuiPure } from '@taiga-ui/cdk';
import { TUI_MONTHS, TuiAppearance, TuiButton } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-chartsalesbetweentwodates',
  standalone: true,
  imports: [
    CommonModule,
    TuiButton,
    TuiAppearance,
    AsyncPipe,
    FormsModule,
    NgIf,
    TuiAxes,
    TuiInputDateRangeModule,
    TuiLineDaysChart,
    TuiSkeleton,
  ],
  templateUrl: './chartsalesbetweentwodates.component.html',
  styleUrls: ['./chartsalesbetweentwodates.component.scss'],
})
export class ChartsalesbetweentwodatesComponent implements OnInit {

  private readonly store = inject(Store<AppState>);
  private readonly months$ = inject(TUI_MONTHS);

  private today = new Date();
  private _range = new BehaviorSubject<TuiDayRange>(this.createInitialRange());

  private createInitialRange(): TuiDayRange {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - 60);
    const toDate = new Date(today); // fin = hoy (31/08), no 01/09 para evitar que la venta de hoy aparezca en mañana
    // Si necesitas incluir mañana, cambia a: toDate.setDate(today.getDate() + 1);
    return new TuiDayRange(
      new TuiDay(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()),
      new TuiDay(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()),
    );
  }

  range$ = this._range.asObservable();

  get range(): TuiDayRange {
    return this._range.value;
  }

  protected readonly maxLength: TuiDayLike = { month: 12 };

  protected salesData$ = this.store.select(selectVentaState).pipe(
    map((state: any) => state.salesDateRangePerDay),
    distinctUntilChanged()
  );

  selectVentas$: Observable<VentaState> = this.store.select(selectVentaState);

  protected readonly xStringify$ = this.months$.pipe(
    map(months => ({ month, day }: TuiDay) => `${months[month]}, ${day}`)
  );

  protected readonly yStringify: TuiStringHandler<number> = (y) =>
    `S/. ${(y ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0, signDisplay: 'exceptZero', style: 'decimal' })}`;

  protected value$ = combineLatest([this.salesData$, this.range$]).pipe(
    switchMap(([data, range]) =>
      of(this.computeValue(range, this.processData(data)))
    ),
    tap()
  );

  protected labels$ = this.range$.pipe(
    switchMap(range => this.computeLabels$(range))
  );

  ngOnInit(): void {
    this.onRangeChange(this._range.value);
  }

  onRangeChange(newRange: TuiDayRange): void {
    this._range.next(newRange);

    this.store.dispatch(cargarVentasRangoFechasTienda({
      fromDate: new Date(newRange.from.year, newRange.from.month, newRange.from.day),
      toDate: new Date(newRange.to.year, newRange.to.month, newRange.to.day)
    }));
  }

  @tuiPure
  private processData(data: Array<[string, number]>): Array<[TuiDay, number]> {
    return data?.map(([dateString, value]) => {
      if (!dateString) return [new TuiDay(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()), value ?? 0] as [TuiDay, number];
      const sep = dateString.includes(',') ? ',' : dateString.includes('-') ? '-' : dateString.includes('/') ? '/' : ',';
      const dateParts = dateString.split(sep).map(s => Number(s.trim()));
      const y = dateParts[0] || this.today.getFullYear();
      let m: number = dateParts[1] ?? this.today.getMonth();
      if (m >= 1 && m <= 12 && sep !== ',') m = m - 1;
      const d = dateParts[2] || 1;
      try {
        const day = new TuiDay(y, m, d);
        return [day, value ?? 0] as [TuiDay, number];
      } catch {
        return [new TuiDay(y, Math.max(0, Math.min(11, m)), Math.max(1, d)), value ?? 0] as [TuiDay, number];
      }
    }) || [];
  }

  @tuiPure
  private computeValue(
    range: TuiDayRange,
    salesData: Array<[TuiDay, number]>
  ): ReadonlyArray<[TuiDay, number]> {
    const dayCount = TuiDay.lengthBetween(range.from, range.to) + 1;

    return Array.from({ length: dayCount }, (_, i) => {
      const currentDay = range.from.append({ day: i });
      const found = salesData.find(([day]) => day.daySame(currentDay));
      return [currentDay, found?.[1] ?? 0];
    });
  }

  @tuiPure
  computeLabels$(range: TuiDayRange): Observable<ReadonlyArray<string | null>> {
    return this.months$.pipe(
      map(months => [
        ...Array.from(
          { length: TuiMonth.lengthBetween(range.from, range.to) + 1 },
          (_, i) => months[range.from.append({ month: i }).month] ?? ''
        ),
        null,
      ])
    );
  }
}
