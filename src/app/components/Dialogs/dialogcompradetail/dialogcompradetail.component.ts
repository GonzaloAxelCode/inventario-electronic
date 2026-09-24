import { CompraItem, ComprobanteCompra } from '@/app/models/compra.models';
import { DialogEditarCompraService } from '@/app/services/dialogs-services/dialog-editar-compra.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
  private readonly editarService = inject(DialogEditarCompraService);

  editar(): void {
    const compra = this.compra;
    this.context.completeWith(true);
    this.editarService.open(compra).subscribe();
  }

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
    if (this.compra.proveedor && typeof this.compra.proveedor === 'object') {
      return this.compra.proveedor.numero_documento || this.compra.proveedor.ruc || '-';
    }
    return '-';
  }

  getItemNombre(item: CompraItem): string {
    return (item as any)?.descripcion ?? item?.producto ?? 'Producto';
  }

  getXmlUrl(): string | null {
    return this.compra.xml_url ?? (this.compra as any).archivo_xml ?? null;
  }

  getPdfUrl(): string | null {
    return this.compra.pdf_url ?? (this.compra as any).archivo_pdf ?? null;
  }

  getImageUrl(): string | null {
    return (this.compra as any).image_url ?? null;
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
