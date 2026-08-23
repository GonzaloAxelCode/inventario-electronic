import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiSkeleton } from '@taiga-ui/kit';
import { AppState } from '@/app/state/app.state';
import { loadResumenClientes, loadClientesFrecuentes, loadTopClientesCompra } from '@/app/state/actions/cliente.actions';
import {
  selectResumenClientes,
  selectLoadingResumen,
  selectClientesFrecuentes,
  selectLoadingClientesFrecuentes,
  selectTopClientesCompra,
  selectLoadingTopClientes
} from '@/app/state/selectors/cliente.selectors';
import { ResumenClientes, ClienteFrecuente, TopClienteCompra } from '@/app/models/cliente.models';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-estadisticas-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiSkeleton],
  templateUrl: './estadisticas-clientes.component.html',
  styleUrl: './estadisticas-clientes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstadisticasClientesComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly cdr = inject(ChangeDetectorRef);

  resumen: ResumenClientes = { total_clientes: 0, nuevos_hoy: 0, nuevos_semana: 0, nuevos_mes: 0 };
  loadingResumen = true;

  clientesFrecuentes: ClienteFrecuente[] = [];
  loadingFrecuentes = true;

  topClientes: TopClienteCompra[] = [];
  loadingTop = true;

  currentYear = new Date().getFullYear();
  yearNumbers = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  monthNames = MONTH_NAMES;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = this.currentYear;

  ngOnInit(): void {
    console.log('[Estadisticas] Dispatching loadResumenClientes');
    this.store.dispatch(loadResumenClientes());
    this.dispatchMonthActions();

    this.store.select(selectResumenClientes).subscribe(resumen => {
      console.log('[Estadisticas] Resumen update:', resumen);
      this.resumen = resumen;
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingResumen).subscribe(loading => {
      console.log('[Estadisticas] Loading resumen:', loading);
      this.loadingResumen = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectClientesFrecuentes).subscribe(clientes => {
      this.clientesFrecuentes = clientes;
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingClientesFrecuentes).subscribe(loading => {
      this.loadingFrecuentes = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectTopClientesCompra).subscribe(top => {
      this.topClientes = top;
      this.cdr.markForCheck();
    });

    this.store.select(selectLoadingTopClientes).subscribe(loading => {
      this.loadingTop = loading;
      this.cdr.markForCheck();
    });
  }

  onMonthChange(value: string): void {
    this.selectedMonth = Number(value);
    this.dispatchMonthActions();
  }

  onYearChange(value: number): void {
    this.selectedYear = value;
    this.dispatchMonthActions();
  }

  private dispatchMonthActions(): void {
    this.store.dispatch(loadClientesFrecuentes({ anio: this.selectedYear, mes: this.selectedMonth }));
    this.store.dispatch(loadTopClientesCompra({ anio: this.selectedYear, mes: this.selectedMonth }));
  }

  get maxCompras(): number {
    return this.clientesFrecuentes.length > 0 ? this.clientesFrecuentes[0].total_compras : 1;
  }

  get maxGastado(): number {
    return this.topClientes.length > 0 ? this.topClientes[0].total_gastado : 1;
  }
}
