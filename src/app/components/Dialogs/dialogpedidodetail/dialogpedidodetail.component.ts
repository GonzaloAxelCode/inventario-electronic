import { Pedido, PedidoProducto } from '@/app/models/pedido.models';
import { actualizarPedido, eliminarPedido } from '@/app/state/actions/pedido.actions';
import { AppState } from '@/app/state/app.state';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiDialogContext, TuiDataList, TuiSelect, TuiAlertService } from '@taiga-ui/core';
import { TuiSelectModule, TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { PedidoSalaService } from '@/app/services/pedido-sala.service';
import { Actions, ofType } from '@ngrx/effects';
import { eliminarPedidoExito } from '@/app/state/actions/pedido.actions';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialogpedidodetail',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiDataList, TuiSelect, TuiSelectModule, TuiInputModule, TuiTextfieldControllerModule],
  templateUrl: './dialogpedidodetail.component.html',
  styleUrl: './dialogpedidodetail.component.scss'
})
export class DialogpedidodetailComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, Pedido>>();
  public pedido: Pedido = { ...this.context.data } as Pedido;
  private readonly store = inject(Store<AppState>);
  private readonly pedidoSalaService = inject(PedidoSalaService);
  private readonly alerts = inject(TuiAlertService);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  showDeleteConfirm = false;
  deleting = false;
  enSala = this.pedidoSalaService.hasPedido(this.pedido.id);

  URL_BASE = URL_BASE;

  readonly tiposPedido = ['MESA', 'DELIVERY', 'TAKEAWAY', 'MOSTRADOR'];
  readonly canalesVenta = ['PRESENCIAL', 'WHATSAPP', 'WEB', 'TELEFONO', 'TIKTOK'];
  readonly prioridades = ['NORMAL', 'URGENTE'];
  readonly estadosPago = ['PENDIENTE', 'PAGADO'];
  readonly estados = ['COTIZADO', 'PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'];
  readonly metodosPago = ['Efectivo', 'YAPE', 'PLIN', 'Transferencia', 'Tarjeta', 'Otros'];

  actualizarCampo(campo: string, valor: any): void {
    this.store.dispatch(actualizarPedido({
      pedidoId: this.pedido.id,
      data: { [campo]: valor }
    }));
    this.pedido = { ...this.pedido, [campo]: valor };
  }

  ngOnInit(): void {
  }

  formatDate(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatTime(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(fecha: string): string {
    if (!fecha) return '-';
    return this.formatDate(fecha) + ' ' + this.formatTime(fecha);
  }

  getProductos(): PedidoProducto[] {
    if (this.pedido.productos_json?.length) return this.pedido.productos_json;
    if (this.pedido.productos?.length) return this.pedido.productos;
    return [];
  }

  getProductSubtotal(item: PedidoProducto): number {
    return (item.cantidad * (item.valor_unitario || item.precio_unitario || 0)) - (item.descuento || 0);
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
      case 'PENDIENTE': return 'negative';
      default: return 'neutral';
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'COTIZADO': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'CONFIRMADO': return 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400';
      case 'EN_PREPARACION': return 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400';
      case 'LISTO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'ENTREGADO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'CANCELADO': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-stone-50 text-stone-700 dark:bg-stone-900/20 dark:text-stone-400';
    }
  }

  getEstadoPagoColor(estado: string): string {
    switch (estado) {
      case 'PAGADO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      default: return 'bg-stone-50 text-stone-700 dark:bg-stone-900/20 dark:text-stone-400';
    }
  }

  getClienteNombre(): string {
    return this.pedido.nombre_cliente || 'Sin cliente';
  }

  getClienteDocumento(): string {
    return this.pedido.numero_documento_cliente || '-';
  }

  getImagenProducto(item: PedidoProducto): string {
    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";
    const raw = (item as any)?.producto_imagen ?? (item as any)?.img_url ?? (item as any)?.imagen;
    if (!raw) return placeholder;
    if (String(raw).startsWith('http')) return String(raw);
    return URL_BASE + String(raw);
  }

  close(): void {
    this.context.completeWith(true);
  }

  guardarCambios(): void {
    this.alerts.open('Cambios actualizados', { label: 'Exito', appearance: 'success' }).subscribe();
  }

  enviarASala(): void {
    this.pedidoSalaService.savePedido(this.pedido);
    this.enSala = true;
    this.alerts.open('Pedido enviado a Sala de Ventas', {
      label: `${this.pedido.numero_pedido} listo para venta`,
      appearance: 'success'
    }).subscribe();
  }

  mostrarConfirmacionEliminar(): void {
    this.showDeleteConfirm = true;
  }

  cancelarEliminar(): void {
    this.showDeleteConfirm = false;
  }

  eliminarPedido(): void {
    this.deleting = true;
    this.pedidoSalaService.removePedido(this.pedido.id);
    this.store.dispatch(eliminarPedido({ pedidoId: this.pedido.id }));

    this.actions$.pipe(
      ofType(eliminarPedidoExito),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.deleting = false;
      this.close();
    });
  }
}
