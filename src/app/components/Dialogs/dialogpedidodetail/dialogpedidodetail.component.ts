import { Pedido, PedidoProducto } from '@/app/models/pedido.models';
import { DialogService } from '@/app/services/dialogs-services/dialog.service';
import { PedidoSalaService } from '@/app/services/pedido-sala.service';
import { actualizarPedido } from '@/app/state/actions/pedido.actions';
import { AppState } from '@/app/state/app.state';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiDialogContext, TuiButton, TuiAppearance, TuiAlertService, TuiLoader, TuiTextfield, TuiDataList } from '@taiga-ui/core';
import { TuiBadge, TuiInputNumber, TuiSelect, TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiSelectModule, TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogpedidodetail',
  standalone: true,
  imports: [CommonModule, TuiButton, TuiAppearance, TuiBadge, TuiLoader, TuiTextfield, TuiDataList, TuiInputNumber, TuiSelect, TuiDataListWrapper, TuiSelectModule, TuiInputModule, TuiTextfieldControllerModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dialogpedidodetail.component.html',
  styleUrl: './dialogpedidodetail.component.scss'
})
export class DialogpedidodetailComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, Pedido>>();
  public pedido: Pedido = this.context.data ?? {} as Pedido;
  private readonly pedidoSalaService = inject(PedidoSalaService);
  private readonly dialogService = inject(DialogService);
  private readonly alerts = inject(TuiAlertService);
  private readonly store = inject(Store<AppState>);
  private readonly fb = inject(FormBuilder);

  enSala = this.pedidoSalaService.hasPedido(this.pedido.id);
  editMode = false;
  editForm!: FormGroup;
  saving = false;

  readonly tiposPedido = ['MESA', 'DELIVERY', 'TAKEAWAY', 'MOSTRADOR'];
  readonly canalesVenta = ['PRESENCIAL', 'WHATSAPP', 'WEB', 'TELEFONO', 'TIKTOK'];
  readonly prioridades = ['NORMAL', 'URGENTE'];
  readonly estadosPago = ['PENDIENTE', 'PARCIAL', 'PAGADO'];
  readonly metodosPago = ['Efectivo', 'YAPE', 'PLIN', 'Transferencia', 'Tarjeta', 'Otros'];

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.editForm = this.fb.group({
      cliente: this.fb.group({
        tipo_documento: [this.pedido.tipo_documento_cliente || '1'],
        numero: [this.pedido.numero_documento_cliente || ''],
        nombre_completo: [this.pedido.nombre_cliente || ''],
        correo_cliente: [this.pedido.email_cliente || ''],
        telefono_cliente: [this.pedido.telefono_cliente || ''],
      }),
      tipo_pedido: [this.pedido.tipo_pedido || 'MOSTRADOR'],
      canal_venta: [this.pedido.canal_venta || 'PRESENCIAL'],
      prioridad: [this.pedido.prioridad || 'NORMAL'],
      metodo_pago: [this.pedido.metodo_pago || 'Efectivo'],
      estado_pago: [this.pedido.estado_pago || 'PENDIENTE'],
      monto_adelanto: [this.pedido.monto_adelanto || 0],
      metodo_pago_adelanto: [this.pedido.metodo_pago_adelanto || ''],
      observaciones: [this.pedido.observaciones || ''],
      notas_internas: [this.pedido.notas_internas || ''],
      direccion_envio: [this.pedido.direccion_envio || ''],
      referencia_ubicacion: [this.pedido.referencia_ubicacion || ''],
      costo_envio: [this.pedido.costo_envio || 0],
      referencia_externa: [this.pedido.referencia_externa || ''],
      productos: this.fb.array(this.buildProductosControls()),
    });
  }

  buildProductosControls(): FormGroup[] {
    const prods = this.getProductos();
    if (!prods.length) return [];
    return prods.map(prod => this.fb.group({
      inventarioId: [prod.producto || prod.id || 0],
      cantidad_final: [prod.cantidad, [Validators.required, Validators.min(1)]],
      descuento: [prod.descuento || 0],
      producto_nombre: [prod.producto_nombre || 'Producto'],
    }));
  }

  get productosFormArray(): FormArray<FormGroup> {
    return this.editForm.get('productos') as FormArray<FormGroup>;
  }

  agregarProductoDialog() {
    this.dialogService.open().subscribe((result: any) => {
      if (result) {
        const existe = this.productosFormArray.controls.some(
          ctrl => ctrl.get('inventarioId')?.value === result.id
        );
        if (existe) {
          this.alerts.open('Producto ya agregado', { label: 'Mensaje', appearance: 'warning' }).subscribe();
          return;
        }
        this.productosFormArray.push(this.fb.group({
          inventarioId: [result.id],
          cantidad_final: [1, [Validators.required, Validators.min(1)]],
          descuento: [0],
          producto_nombre: [result.producto_nombre],
        }));
      }
    });
  }

  eliminarProducto(index: number) {
    this.productosFormArray.removeAt(index);
  }

  toggleEdit() {
    if (this.editMode) {
      this.initForm();
    }
    this.editMode = !this.editMode;
  }

  guardarCambios() {
    if (this.editForm.invalid) return;

    this.saving = true;
    const formValue = this.editForm.value;

    const data: any = {
      cliente: formValue.cliente,
      tipo_pedido: formValue.tipo_pedido,
      canal_venta: formValue.canal_venta,
      prioridad: formValue.prioridad,
      metodo_pago: formValue.metodo_pago,
      estado_pago: formValue.estado_pago,
      monto_adelanto: formValue.monto_adelanto,
      metodo_pago_adelanto: formValue.metodo_pago_adelanto,
      observaciones: formValue.observaciones,
      notas_internas: formValue.notas_internas,
      direccion_envio: formValue.direccion_envio,
      referencia_ubicacion: formValue.referencia_ubicacion,
      costo_envio: formValue.costo_envio,
      referencia_externa: formValue.referencia_externa,
      productos: formValue.productos.map((p: any) => ({
        inventarioId: p.inventarioId,
        cantidad_final: parseInt(p.cantidad_final),
        descuento: p.descuento || 0,
      })),
    };

    this.store.dispatch(actualizarPedido({ pedidoId: this.pedido.id, data }));

    setTimeout(() => {
      this.saving = false;
      this.editMode = false;
      this.pedido.nombre_cliente = data.cliente.nombre_completo;
      this.pedido.numero_documento_cliente = data.cliente.numero;
      this.pedido.telefono_cliente = data.cliente.telefono_cliente;
      this.pedido.email_cliente = data.cliente.correo_cliente;
      this.pedido.tipo_pedido = data.tipo_pedido;
      this.pedido.canal_venta = data.canal_venta;
      this.pedido.prioridad = data.prioridad;
      this.pedido.metodo_pago = data.metodo_pago;
      this.pedido.estado_pago = data.estado_pago;
      this.pedido.observaciones = data.observaciones;
      this.pedido.notas_internas = data.notas_internas;
      this.pedido.direccion_envio = data.direccion_envio;
      this.pedido.costo_envio = data.costo_envio;
    }, 1000);
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

  getProductos(): PedidoProducto[] {
    if (this.pedido.productos?.length) return this.pedido.productos;
    if (this.pedido.productos_json?.length) return this.pedido.productos_json;
    return [];
  }

  getProductSubtotal(item: PedidoProducto): number {
    return (item.cantidad * (item.valor_unitario || item.precio_unitario || 0)) - (item.descuento || 0);
  }

  getClienteNombre(): string {
    return this.pedido.nombre_cliente || 'Sin cliente';
  }

  getClienteDocumento(): string {
    return this.pedido.numero_documento_cliente || '-';
  }

  enviarASala(): void {
    this.pedidoSalaService.savePedido(this.pedido);
    this.enSala = true;
    this.alerts.open('Pedido enviado a Sala de Ventas', {
      label: `${this.pedido.numero_pedido} listo para venta`,
      appearance: 'success'
    }).subscribe();
  }

  removerDeSala(): void {
    this.pedidoSalaService.removePedido(this.pedido.id);
    this.enSala = false;
    this.alerts.open('Pedido removido de Sala de Ventas', {
      label: `${this.pedido.numero_pedido} removido`,
      appearance: 'warning'
    }).subscribe();
  }

  close(): void {
    this.context.completeWith(true);
  }
}
