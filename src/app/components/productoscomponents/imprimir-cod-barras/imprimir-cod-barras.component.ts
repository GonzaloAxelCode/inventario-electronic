import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, QueryList, ViewChildren, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as JsBarcodeImport from 'jsbarcode';
import { Producto } from '@/app/models/producto.models';
import { AppState } from '@/app/state/app.state';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { loadProductosAction } from '@/app/state/actions/producto.actions';
import { PAGE_SIZE_PRODUCTS } from '@/app/services/utils/pages-sizes';

interface ItemBarras {
  producto: Producto;
  cantidad: number;
}

interface LabelCopy {
  producto: Producto;
  index: number;
}

@Component({
  selector: 'app-imprimir-cod-barras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imprimir-cod-barras.component.html',
  styleUrl: './imprimir-cod-barras.component.scss'
})
export class ImprimirCodBarrasComponent implements OnInit, AfterViewChecked {
  private store = inject(Store<AppState>);
  private cdr = inject(ChangeDetectorRef);

  @ViewChildren('barcodeSvg') barcodeSvgs!: QueryList<ElementRef<SVGElement>>;

  // data
  productos: Producto[] = [];
  search = '';
  filtered: Producto[] = [];
  selected: ItemBarras[] = [];

  // config térmica
  papel: '58' | '80' = '58';
  mostrarNombre = true;
  mostrarPrecio = true;
  mostrarSku = true;
  altoBarcode = 40;
  anchoLabel: number = 48; // mm aprox
  columnas: 1 | 2 | 3 = 1;
  // precio: tomamos de inventario.costo_venta si existe
  private pendingRender = false;

  private getJsBarcode(): any {
    const anyImport: any = JsBarcodeImport as any;
    return anyImport.default || anyImport;
  }

  get totalEtiquetas(): number {
    return this.selected.reduce((a, b) => a + b.cantidad, 0);
  }

  get labels(): LabelCopy[] {
    const arr: LabelCopy[] = [];
    let idx = 0;
    for (const it of this.selected) {
      for (let i = 0; i < it.cantidad; i++) {
        arr.push({ producto: it.producto, index: idx++ });
      }
    }
    return arr;
  }

  get papelWidthMm(): string {
    return this.papel === '58' ? '58mm' : '80mm';
  }

  ngOnInit(): void {
    this.store.select(selectProductoState).subscribe(state => {
      this.productos = state.productos || [];
      this.applyFilter();
      this.cdr.markForCheck();
    });
    // si no hay productos, cargar primera página
    setTimeout(() => {
      if (this.productos.length === 0) {
        this.store.dispatch(loadProductosAction({ page: 1, page_size: PAGE_SIZE_PRODUCTS }));
      }
    }, 300);
  }

  ngAfterViewChecked(): void {
    if (this.pendingRender) {
      this.pendingRender = false;
      this.renderBarcodes();
    }
  }

  onSearchChange(v: string) {
    this.search = v;
    this.applyFilter();
  }

  private applyFilter() {
    const q = this.search.trim().toLowerCase();
    if (!q) {
      this.filtered = this.productos.slice(0, 20);
      return;
    }
    this.filtered = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.categoria_nombre || '').toLowerCase().includes(q)
    ).slice(0, 20);
  }

  addProducto(p: Producto) {
    const found = this.selected.find(s => s.producto.id === p.id);
    if (found) {
      found.cantidad += 1;
    } else {
      this.selected.push({ producto: p, cantidad: 1 });
    }
    this.search = '';
    this.applyFilter();
    this.scheduleRender();
  }

  removeItem(idx: number) {
    this.selected.splice(idx, 1);
    this.scheduleRender();
  }

  inc(idx: number) {
    this.selected[idx].cantidad += 1;
    this.scheduleRender();
  }

  dec(idx: number) {
    if (this.selected[idx].cantidad > 1) {
      this.selected[idx].cantidad -= 1;
    } else {
      this.selected.splice(idx, 1);
    }
    this.scheduleRender();
  }

  clearAll() {
    this.selected = [];
    this.scheduleRender();
  }

  getPrecio(p: Producto): number {
    // Producto.inventario?.costo_venta es el precio venta
    const inv: any = (p as any).inventario;
    if (inv?.costo_venta != null) return Number(inv.costo_venta);
    if (inv?.costoVenta != null) return Number(inv.costoVenta);
    return 0;
  }

  scheduleRender() {
    this.pendingRender = true;
    this.cdr.markForCheck();
    // fallback timeout por si AfterViewChecked no dispara por falta de cambio
    setTimeout(() => this.renderBarcodes(), 80);
  }

  private renderBarcodes() {
    if (!this.barcodeSvgs) return;
    const JsBarcode = this.getJsBarcode();
    this.barcodeSvgs.forEach((elRef, i) => {
      const label = this.labels[i];
      if (!label) return;
      const svg = elRef.nativeElement;
      try {
        // limpiar contenido previo
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        JsBarcode(svg, label.producto.sku, {
          format: 'CODE128',
          lineColor: '#000',
          width: 1.3,
          height: this.altoBarcode,
          displayValue: this.mostrarSku,
          fontSize: 9,
          margin: 2,
          background: '#fff',
          textMargin: 1,
        });
      } catch (e) {
        // sku inválido: mostrar texto
      }
    });
  }

  onConfigChange() {
    this.scheduleRender();
  }

  imprimir() {
    if (this.labels.length === 0) return;

    // Generar HTML para ventana de impresión con SVGs ya renderizados
    const labelsHtml = this.labels.map(l => {
      const nombre = this.escapeHtml(l.producto.nombre);
      const sku = this.escapeHtml(l.producto.sku);
      const precio = this.getPrecio(l.producto);
      const precioTxt = precio ? `S/ ${precio.toFixed(2)}` : '';
      // generar barcode svg string con JsBarcode en elemento temporal
      let barcodeSvg = '';
      try {
        const tmpSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const JsBarcodeFn = this.getJsBarcode();
        JsBarcodeFn(tmpSvg, l.producto.sku, {
          format: 'CODE128',
          lineColor: '#000',
          width: 1.4,
          height: this.altoBarcode,
          displayValue: this.mostrarSku,
          fontSize: 10,
          margin: 0,
          background: '#fff',
          textMargin: 2,
        });
        barcodeSvg = tmpSvg.outerHTML;
      } catch {
        barcodeSvg = `<div style="font-family:monospace;font-size:10px;text-align:center;border:1px dashed #999;padding:4px;">${sku}</div>`;
      }

      return `
        <div class="label">
          ${this.mostrarNombre ? `<div class="label-nombre">${nombre}</div>` : ''}
          <div class="label-barcode">${barcodeSvg}</div>
          ${this.mostrarPrecio && precioTxt ? `<div class="label-precio">${precioTxt}</div>` : ''}
          ${!this.mostrarSku ? `<div class="label-sku-fallback">${sku}</div>` : ''}
        </div>
      `;
    }).join('');

    const cols = this.papel === '58' ? 1 : this.columnas;
    const gap = 4;
    const pageWidth = this.papel === '58' ? '58mm' : '80mm';

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Imprimir Códigos de Barras</title>
<style>
  @page { size: ${pageWidth} auto; margin: 2mm; }
  * { box-sizing: border-box; }
  body { margin:0; padding:2mm; font-family: Arial, Helvetica, sans-serif; color:#000; background:#fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .grid {
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    gap: ${gap}mm;
    width: 100%;
  }
  .label {
    border: 1px dashed #bbb;
    border-radius: 2mm;
    padding: 2.5mm 2mm 2mm 2mm;
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 28mm;
    page-break-inside: avoid;
    break-inside: avoid;
    background: #fff;
    color: #000;
  }
  .label-nombre {
    font-size: 8.5pt;
    font-weight: 700;
    color: #000;
    text-align: center;
    line-height: 1.1;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 1mm;
    word-break: break-word;
  }
  .label-barcode { width: 100%; display:flex; justify-content:center; }
  .label-barcode svg { max-width: 100%; height: auto; }
  .label-precio { font-size: 9pt; font-weight: 800; color: #000; margin-top: 1mm; letter-spacing: 0.2px; }
  .label-sku-fallback { font-size: 7pt; font-family: monospace; color: #000; margin-top: 0.5mm; }
  @media print {
    .no-print { display:none !important; }
    body { padding: 0; }
  }
</style>
</head>
<body>
  <div class="grid">${labelsHtml}</div>
  <script>window.onload = () => { setTimeout(()=>{ window.print(); window.close(); }, 300); }<\/script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) {
      // fallback: imprimir en misma ventana usando iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => iframe.remove(), 1000);
        }, 400);
      }
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
