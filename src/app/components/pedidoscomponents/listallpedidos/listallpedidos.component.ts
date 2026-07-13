import { Pedido } from '@/app/models/pedido.models';
import { PAGE_SIZE_PEDIDOS } from '@/app/services/utils/pages-sizes';
import { buscarPedidos, cancelarPedido } from '@/app/state/actions/pedido.actions';
import { AppState } from '@/app/state/app.state';
import { selectPedido } from '@/app/state/selectors/pedido.selectors';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiDay, TuiDayLike, TuiDayRange } from '@taiga-ui/cdk';
import { TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiPagination, TuiSwitch } from '@taiga-ui/kit';
import { TuiExpand } from '@taiga-ui/experimental';
import { TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateRangeModule, TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { Subject, takeUntil } from 'rxjs';
import * as dayjs from 'dayjs';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';

//@ts-ignore
dayjs.extend(advancedFormat); //@ts-ignore
dayjs.extend(localizedFormat);
dayjs.locale('es');

@Component({
  selector: 'app-listallpedidos',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    FormsModule,
    ReactiveFormsModule,
    TuiBadge,
    TuiPagination,
    TuiLoader,
    TuiButton,
    TuiTextfield,
    TuiSwitch,
    TuiSearch,
    TuiExpand,
    TuiInputDateRangeModule,
    TuiInputModule,
    TuiSelectModule,
  ],
  templateUrl: './listallpedidos.component.html',
  styleUrl: './listallpedidos.component.scss'
})
export class ListallpedidosComponent implements OnInit, OnDestroy {

  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();

  pedidos: Pedido[] = [];
  loading = false;
  indexPage = 0;
  lengthPages = 0;
  count = 0;
  expanded = false;

  readonly maxLength: TuiDayLike = { month: 12 };

  private _range = new Subject<TuiDayRange>();
  range: TuiDayRange = new TuiDayRange(
    TuiDay.currentLocal().append({ day: -TuiDay.currentLocal().day + 1 }),
    TuiDay.currentLocal()
  );

  form = new FormGroup({
    numero_pedido: new FormControl(''),
    metodo_pago: new FormControl(''),
    estado: new FormControl(''),
    nombre_cliente: new FormControl(''),
    numero_documento_cliente: new FormControl(''),
  });

  readonly estados = ['COTIZADO', 'PENDIENTE', 'REALIZADO', 'CANCELADO'];
  readonly metodos_pago = ['Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Transferencia', 'Otros'];

  ngOnInit() {
    this.store.select(selectPedido)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.pedidos = state.pedidos || [];
        this.loading = !!state.loading;
        this.indexPage = state.index_page ?? 0;
        this.lengthPages = state.length_pages ?? 0;
        this.count = state.count ?? 0;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRangeChange(newRange: TuiDayRange): void {
    this.range = newRange;
  }

  formatDate(date: string): string {
    //@ts-ignore
    const txt = dayjs(date).format('D, MMM YYYY');
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  formatTime(date: string): string {
    //@ts-ignore
    return dayjs(date).format('h:mm A');
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'COTIZADO': return 'info';
      case 'PENDIENTE': return 'warning';
      case 'REALIZADO': return 'positive';
      case 'CANCELADO': return 'negative';
      default: return 'neutral';
    }
  }

  getClienteNombre(pedido: Pedido): string {
    return pedido.nombre_cliente || 'Sin cliente';
  }

  onSearch() {
    const formValues = this.form.value;
    const cleanFilters: any = {};

    if (this.range) {
      cleanFilters.from_date = this.range.from.toString();
      cleanFilters.to_date = this.range.to.toString();
    }
    if (formValues.numero_pedido) cleanFilters.numero_pedido = formValues.numero_pedido;
    if (formValues.metodo_pago) cleanFilters.metodo_pago = formValues.metodo_pago;
    if (formValues.estado) cleanFilters.estado = formValues.estado;
    if (formValues.nombre_cliente) cleanFilters.nombre_cliente = formValues.nombre_cliente;
    if (formValues.numero_documento_cliente) cleanFilters.numero_documento_cliente = formValues.numero_documento_cliente;

    this.store.dispatch(buscarPedidos({ page: 1, page_size: PAGE_SIZE_PEDIDOS, filters: cleanFilters }));
  }

  onCancelPedido(pedidoId: number) {
    if (confirm('¿Estás seguro de cancelar este pedido?')) {
      this.store.dispatch(cancelarPedido({ pedidoId }));
    }
  }

  goToPage(index: number): void {
    const formValues = this.form.value;
    const cleanFilters: any = {};

    if (this.range) {
      cleanFilters.from_date = this.range.from.toString();
      cleanFilters.to_date = this.range.to.toString();
    }
    if (formValues.numero_pedido) cleanFilters.numero_pedido = formValues.numero_pedido;
    if (formValues.metodo_pago) cleanFilters.metodo_pago = formValues.metodo_pago;
    if (formValues.estado) cleanFilters.estado = formValues.estado;
    if (formValues.nombre_cliente) cleanFilters.nombre_cliente = formValues.nombre_cliente;
    if (formValues.numero_documento_cliente) cleanFilters.numero_documento_cliente = formValues.numero_documento_cliente;

    this.store.dispatch(buscarPedidos({ page: index + 1, page_size: PAGE_SIZE_PEDIDOS, filters: cleanFilters }));
  }

  clearFilters() {
    this.form.reset();
    this.range = new TuiDayRange(
      TuiDay.currentLocal().append({ day: -TuiDay.currentLocal().day + 1 }),
      TuiDay.currentLocal()
    );
    this.store.dispatch(buscarPedidos({
      page: 1,
      page_size: PAGE_SIZE_PEDIDOS,
      filters: {
        from_date: this.range.from.toString(),
        to_date: this.range.to.toString(),
      }
    }));
  }
}
