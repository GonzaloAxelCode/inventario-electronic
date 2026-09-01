import { Pedido } from '@/app/models/pedido.models';
import { DialogPedidoDetailService } from '@/app/services/dialogs-services/dialog-pedido-detail.service';
import { PAGE_SIZE_PEDIDOS } from '@/app/services/utils/pages-sizes';
import { cargarPedidos, cancelarPedido } from '@/app/state/actions/pedido.actions';
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
  private dialogPedidoDetail = inject(DialogPedidoDetailService);
  private destroy$ = new Subject<void>();

  pedidos: Pedido[] = [];
  loading = false;
  indexPage = 0;
  lengthPages = 0;
  count = 0;
  expanded = false;
  viewMode: 'table' | 'grid' = 'table';

  readonly maxLength: TuiDayLike = { month: 12 };

  range: TuiDayRange = new TuiDayRange(
    TuiDay.currentLocal().append({ month: -3 }),
    TuiDay.currentLocal()
  );

  form = new FormGroup({
    numero_pedido: new FormControl(''),
    nombre_cliente: new FormControl(''),
    numero_documento_cliente: new FormControl(''),
    email_cliente: new FormControl(''),
    telefono_cliente: new FormControl(''),
    referencia_externa: new FormControl(''),
    estado: new FormControl(''),
    tipo_pedido: new FormControl(''),
    canal_venta: new FormControl(''),
    estado_pago: new FormControl(''),
    prioridad: new FormControl(''),
    metodo_pago: new FormControl(''),
  });

  readonly estados = ['COTIZADO', 'PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'];
  readonly tiposPedido = ['MESA', 'DELIVERY', 'TAKEAWAY', 'MOSTRADOR'];
  readonly canalesVenta = ['PRESENCIAL', 'WHATSAPP', 'WEB', 'TELEFONO', 'TIKTOK'];
  readonly estadosPago = ['PENDIENTE', 'PARCIAL', 'PAGADO'];
  readonly prioridades = ['NORMAL', 'URGENTE'];
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

    this.onSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRangeChange(newRange: TuiDayRange): void {
    this.range = newRange;
  }

  private buildDateArray(day: TuiDay): number[] {
    return [day.year, day.month, day.day];
  }

  private buildFilters(): any {
    const formValues = this.form.value;
    const filters: any = {};

    if (this.range) {
      filters.from_date = this.buildDateArray(this.range.from);
      filters.to_date = this.buildDateArray(this.range.to);
    }
    if (formValues.numero_pedido) filters.numero_pedido = formValues.numero_pedido;
    if (formValues.nombre_cliente) filters.nombre_cliente = formValues.nombre_cliente;
    if (formValues.numero_documento_cliente) filters.numero_documento_cliente = formValues.numero_documento_cliente;
    if (formValues.email_cliente) filters.email_cliente = formValues.email_cliente;
    if (formValues.telefono_cliente) filters.telefono_cliente = formValues.telefono_cliente;
    if (formValues.referencia_externa) filters.referencia_externa = formValues.referencia_externa;
    if (formValues.estado) filters.estado = formValues.estado;
    if (formValues.tipo_pedido) filters.tipo_pedido = formValues.tipo_pedido;
    if (formValues.canal_venta) filters.canal_venta = formValues.canal_venta;
    if (formValues.estado_pago) filters.estado_pago = formValues.estado_pago;
    if (formValues.prioridad) filters.prioridad = formValues.prioridad;
    if (formValues.metodo_pago) filters.metodo_pago = formValues.metodo_pago;

    return filters;
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
      case 'CONFIRMADO': return 'accent';
      case 'EN_PREPARACION': return 'primary';
      case 'LISTO': return 'success';
      case 'ENTREGADO': return 'positive';
      case 'CANCELADO': return 'negative';
      default: return 'neutral';
    }
  }

  getEstadoPagoBadge(estado: string): string {
    switch (estado) {
      case 'PAGADO': return 'positive';
      case 'PARCIAL': return 'warning';
      case 'PENDIENTE': return 'negative';
      default: return 'neutral';
    }
  }

  getClienteNombre(pedido: Pedido): string {
    return pedido.nombre_cliente || 'Sin cliente';
  }

  onSearch() {
    const filters = this.buildFilters();
    this.store.dispatch(cargarPedidos({ page: 1, page_size: PAGE_SIZE_PEDIDOS, filters }));
  }

  onCancelPedido(pedidoId: number) {
    if (confirm('¿Estás seguro de cancelar este pedido?')) {
      this.store.dispatch(cancelarPedido({ pedidoId }));
    }
  }

  onPedidoClick(pedido: Pedido) {
    this.dialogPedidoDetail.open(pedido).subscribe();
  }

  goToPage(index: number): void {
    const filters = this.buildFilters();
    this.store.dispatch(cargarPedidos({ page: index + 1, page_size: PAGE_SIZE_PEDIDOS, filters }));
  }

  clearFilters() {
    this.form.reset();
    this.range = new TuiDayRange(
      TuiDay.currentLocal().append({ month: -3 }),
      TuiDay.currentLocal()
    );
    this.onSearch();
  }
}
