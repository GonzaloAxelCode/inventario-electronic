import { cargarResumenVentasByDate } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVentaState } from '@/app/state/selectors/venta.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiDataList, TuiDropdown, TuiFormatDatePipe, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSkeleton } from '@taiga-ui/kit';
import { TuiInputDateModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { format } from 'date-fns'; // Importa la función format de date-fns
import { es } from 'date-fns/locale'; // Importa la configuración regional para español
import { map, Observable, Subject, takeUntil } from 'rxjs';

import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
@Component({
  selector: 'app-dashboard-sales-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiDataList,
    TuiButton, TuiDataListWrapper,
    TuiDataList,
    TuiDropdown, TuiTextfield,
    TuiInputModule, TuiTextareaModule,
    TuiInputDateModule,
    TuiTextfieldControllerModule, TuiSelectModule, TuiSkeleton
  ],
  providers: [TuiFormatDatePipe],
  templateUrl: './dashboard-sales-cards.component.html',
  styleUrl: './dashboard-sales-cards.component.scss'
})
export class DashboardSalesCardsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  todaySales = 0
  thisWeekSales = 0
  thisMonthSales = 0
  ventasState$?: Observable<VentaState>
  currentDay: string = '';
  currentMonth: string = '';

  currentWeek: number = 0;
  tiendaUser!: number
  constructor(private store: Store<AppState>, private tuiDatePipe: TuiFormatDatePipe) {
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
    const today = new Date();
    this.currentDay = this.getDayName(today.getDay());
    this.currentMonth = this.getMonthName(today.getMonth());
    this.currentWeek = this.getWeekNumber(today);



  }
  protected readonly testForm = new FormGroup({
    testValue: new FormControl(TuiDay.currentLocal()),
  });

  years = [
    { number: 2025 },
    { number: 2026 },
    { number: 2027 },
  ]
  months = [
    { number: 1, name: 'Enero' },
    { number: 2, name: 'Febrero' },
    { number: 3, name: 'Marzo' },
    { number: 4, name: 'Abril' },
    { number: 5, name: 'Mayo' },
    { number: 6, name: 'Junio' },
    { number: 7, name: 'Julio' },
    { number: 8, name: 'Agosto' },
    { number: 9, name: 'Septiembre' },
    { number: 10, name: 'Octubre' },
    { number: 11, name: 'Noviembre' },
    { number: 12, name: 'Diciembre' },
  ];
  protected readonly testFormMonth = new FormGroup({
    month: new FormControl(this.getCurrentMonthName()), // Valor inicial: 0 (Enero)
    year: new FormControl(parseInt(new Date().getFullYear().toString())), // Valor inicial: 2026
  });
  onMonthChange(selectedMonth: string) {
    const selectedMonthObj: any = this.months.find((month) => month.name === selectedMonth);
    const formValues = this.testFormMonth.value;


    // Aquí puedes hacer algo con el mes seleccionado, como actualizar otro campo o realizar alguna acción.
    this.store.dispatch(cargarResumenVentasByDate({

      month: selectedMonthObj.number,
      day: 1,
      year: parseInt(formValues.year?.toString() || '2026'), // Año actual
      tipo: "month_year"
    }))
  }
  onYearChange(selectedYear: number) {

    const formValues = this.testFormMonth.value;
    const selectedMonthObj: any = this.months.find((month) => month.name === formValues.month);
    // Aquí puedes hacer algo con el mes seleccionado, como actualizar otro campo o realizar alguna acción.
    this.store.dispatch(cargarResumenVentasByDate({
      month: selectedMonthObj.number,
      day: 1,
      year: selectedYear, // Año actual
      tipo: "month_year"
    }))
  }




  getCurrentMonthName(): string {
    const currentMonth = new Date().getMonth(); // Obtiene el índice del mes actual (0 = Enero, 1 = Febrero, etc.)
    return this.months[currentMonth].name; // Devuelve el nombre del mes actual
  }
  getMonthNombre(monthNumber: number): string {
    const month = this.months.find((m) => m.number === monthNumber);
    return month ? month.name : 'Mes no válido'; // Valor predeterminado si no se encuentra el mes
  }
  ngOnInit() {
    this.ventasState$ = this.store.select(selectVentaState).pipe(
      map((state: VentaState) => {

        this.todaySales = state.todaySales;
        this.thisWeekSales = state.thisWeekSales;
        this.thisMonthSales = state.thisMonthSales;

        return state;

      })
    );
    this.ventasState$.subscribe();
    this.testForm.get('testValue')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((date: any) => {
        if (date) {
          this.store.dispatch(cargarResumenVentasByDate({
            month: date.month + 1,
            day: date.day,
            year: date.year,
            tipo: 'day_month_year'
          }));
        }
      });
  }
  getFormattedDate() {
    const date = this.testForm.get('testValue')?.value as TuiDay;
    return format(date.toLocalNativeDate(), 'EEEE dd MMMM', { locale: es });
  }

  getDayName(dayIndex: number): string {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return daysOfWeek[dayIndex];
  }


  getMonthName(monthIndex: number): string {
    const monthsOfYear = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return monthsOfYear[monthIndex];
  }

  // Función para obtener el número de la semana
  getWeekNumber(date: Date): number {
    // Obtener el primer día del mes
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    // Obtener el día de la semana del primer día del mes
    const dayOfWeek = firstDayOfMonth.getDay();

    // Calcular el día del mes
    const dayOfMonth = date.getDate();

    // Si el primer día del mes no es domingo (que es el día 0 en `getDay()`),
    // desplazamos el inicio de la primera semana para que comience el lunes.
    const startOffset = (dayOfWeek === 0 ? 7 : dayOfWeek);

    // Calcular el número de semana
    const weekNumber = Math.ceil((dayOfMonth + startOffset - 1) / 7);

    return weekNumber;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}