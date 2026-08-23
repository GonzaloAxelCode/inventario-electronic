import { CompraItem, ComprobanteCompra } from '@/app/models/compra.models';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiDialogContext, TuiButton, TuiAppearance } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogcompradetail',
  standalone: true,
  imports: [CommonModule, TuiButton, TuiAppearance, TuiBadge],
  templateUrl: './dialogcompradetail.component.html',
  styleUrl: './dialogcompradetail.component.scss'
})
export class DialogcompradetailComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, ComprobanteCompra>>();
  public compra: ComprobanteCompra = this.context.data ?? {} as ComprobanteCompra;

  getTipoComprobante(tipo: string): string {
    return tipo === '01' ? 'Factura' : 'Boleta';
  }

  getProveedorNombre(): string {
    if (this.compra.nombre_proveedor) return this.compra.nombre_proveedor;
    if (this.compra.proveedor) {
      if (typeof this.compra.proveedor === 'string') return this.compra.proveedor;
      if (typeof this.compra.proveedor === 'object' && this.compra.proveedor.nombre) return this.compra.proveedor.nombre;
    }
    return 'Sin proveedor';
  }

  getProveedorRuc(): string {
    if (this.compra.numero_documento_proveedor) return this.compra.numero_documento_proveedor;
    if (this.compra.proveedor && typeof this.compra.proveedor === 'object') return this.compra.proveedor.ruc;
    return '-';
  }

  formatDate(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getItemSubtotal(item: CompraItem): number {
    return (item.cantidad * item.precio_unitario) - (item.descuento || 0);
  }

  getItemsTotal(): number {
    if (!this.compra.items?.length) return 0;
    return this.compra.items.reduce((sum, item) => sum + this.getItemSubtotal(item), 0);
  }

  close(): void {
    this.context.completeWith(true);
  }
}
