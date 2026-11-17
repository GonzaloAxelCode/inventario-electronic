import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiDialogContext, TuiTextfield } from '@taiga-ui/core';
import { TuiSelectModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { finalize } from 'rxjs';
import { ReportExportService, TipoExportacion } from './report-export-types';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const TITULOS: Record<TipoExportacion, { titulo: string; desc: string }> = {
  ventas: { titulo: 'Ventas del mes', desc: 'Detalle de ventas del mes elegido en CSV' },
  mensual: { titulo: 'Ventas del año', desc: 'Totales de enero a diciembre en CSV' },
  ganancias: { titulo: 'Ganancias del mes', desc: 'Venta, costo, ganancia y margen en CSV' },
  'top-productos': { titulo: 'Top productos', desc: 'Lo que más rota: cantidad e ingresos' },
  'top-categorias': { titulo: 'Top categorías', desc: 'Dónde concentrar tus compras' },
  'metodos-pago': { titulo: 'Métodos de pago', desc: 'Cuánto entra por Yape, efectivo, tarjeta' },
  clientes: { titulo: 'Clientes del mes', desc: 'Quiénes compraron y quiénes vuelven' },
  'clientes-tabla': { titulo: 'Padrón de clientes', desc: 'Base completa de clientes para contactar' },
  inventario: { titulo: 'Inventario valorizado', desc: 'Cuánto dinero tienes en stock' },
  'stock-bajo': { titulo: 'Qué reponer', desc: 'Stock en mínimo o menos, con faltante' },
  'comprobantes-zip': { titulo: 'Respaldo de comprobantes', desc: 'ZIP con XML de ventas del mes para tu contador' },
  'compras-zip': { titulo: 'Respaldo de compras', desc: 'ZIP con XML de compras del mes para tu contador' },
};

const METODOS_PAGO = ['todos', 'Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta'];

export interface ExportDialogData {
  tipo: TipoExportacion;
  month: number;
  year: number;
}

@Component({
  selector: 'app-export-options-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiButton, TuiDataList, TuiTextfield, TuiSelectModule],
  templateUrl: './export-options-dialog.component.html',
})
export class ExportOptionsDialogComponent {
  private readonly exportService = inject(ReportExportService);
  protected readonly context = injectContext<TuiDialogContext<boolean, ExportDialogData>>();

  tipo: TipoExportacion = this.context.data?.tipo ?? 'ventas';
  month = this.context.data?.month ?? new Date().getMonth() + 1;
  year = this.context.data?.year ?? new Date().getFullYear();

  meses = MESES;
  metodosPago = METODOS_PAGO;
  years = [this.year, this.year - 1, this.year - 2];

  detalleGanancias: 'venta' | 'producto' = 'venta';
  filtroTipo: 'todos' | 'accesorio' | 'celular' = 'todos';
  filtroMetodo = 'todos';
  filtroGrupo: 'todos' | 'accesorios' | 'repuestos' = 'todos';
  filtroInventario: 'accesorios' | 'celulares' | 'repuestos' = 'accesorios';
  downloading = false;

  get titulo(): string {
    return TITULOS[this.tipo].titulo;
  }

  get descripcion(): string {
    return TITULOS[this.tipo].desc;
  }

  get necesitaMes(): boolean {
    return this.tipo === 'ventas' || this.tipo === 'ganancias'
      || this.tipo === 'top-productos' || this.tipo === 'top-categorias'
      || this.tipo === 'metodos-pago' || this.tipo === 'clientes'
      || this.tipo === 'comprobantes-zip' || this.tipo === 'compras-zip';
  }

  get necesitaYear(): boolean {
    return this.necesitaMes || this.tipo === 'mensual';
  }

  get necesitaTipo(): boolean {
    return this.tipo === 'ventas' || this.tipo === 'ganancias'
      || this.tipo === 'top-productos' || this.tipo === 'top-categorias'
      || this.tipo === 'metodos-pago' || this.tipo === 'mensual';
  }

  get necesitaMetodo(): boolean {
    return this.tipo === 'ventas' || this.tipo === 'ganancias' || this.tipo === 'clientes';
  }

  get necesitaGrupo(): boolean {
    return this.tipo === 'stock-bajo';
  }

  get necesitaInventario(): boolean {
    return this.tipo === 'inventario';
  }

  get esZip(): boolean {
    return this.tipo === 'comprobantes-zip' || this.tipo === 'compras-zip';
  }

  cancelar(): void {
    if (!this.downloading) this.context.completeWith(false);
  }

  descargar(): void {
    const pad = String(this.month).padStart(2, '0');
    const sufTipo = this.filtroTipo !== 'todos' ? `_${this.filtroTipo}` : '';
    const sufMet = this.filtroMetodo !== 'todos' ? `_${this.filtroMetodo.toLowerCase()}` : '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obs: any;
    let filename: string;
    const esBlob = (v: unknown): v is Blob => v instanceof Blob;
    switch (this.tipo) {
      case 'mensual':
        obs = this.exportService.exportVentasMensual(this.year, this.filtroTipo);
        filename = `ventas_mensual_${this.year}${sufTipo}.csv`;
        break;
      case 'ganancias': {
        const sufDet = this.detalleGanancias === 'producto' ? '_productos' : '';
        obs = this.exportService.exportGanancias(this.month, this.year, this.detalleGanancias, this.filtroTipo, this.filtroMetodo);
        filename = `ganancias${sufDet}_${this.year}-${pad}${sufTipo}${sufMet}.csv`;
        break;
      }
      case 'top-productos':
        obs = this.exportService.exportTopProductos(this.month, this.year, this.filtroTipo);
        filename = `top_productos_${this.year}-${pad}${sufTipo}.csv`;
        break;
      case 'top-categorias':
        obs = this.exportService.exportTopCategorias(this.month, this.year, this.filtroTipo);
        filename = `top_categorias_${this.year}-${pad}${sufTipo}.csv`;
        break;
      case 'metodos-pago':
        obs = this.exportService.exportMetodosPago(this.month, this.year, this.filtroTipo);
        filename = `metodos_pago_${this.year}-${pad}${sufTipo}.csv`;
        break;
      case 'clientes':
        obs = this.exportService.exportClientes(this.month, this.year, this.filtroMetodo);
        filename = `clientes_${this.year}-${pad}${sufMet}.csv`;
        break;
      case 'clientes-tabla':
        obs = this.exportService.exportClientesTabla();
        filename = `clientes_padron.csv`;
        break;
      case 'inventario':
        obs = this.exportService.exportInventario(this.filtroInventario);
        filename = `${this.filtroInventario}.csv`;
        break;
      case 'stock-bajo': {
        const sufGrupo = this.filtroGrupo !== 'todos' ? `_${this.filtroGrupo}` : '';
        obs = this.exportService.exportStockBajo(this.filtroGrupo);
        filename = `stock_bajo${sufGrupo}.csv`;
        break;
      }
      case 'comprobantes-zip':
        obs = this.exportService.exportComprobantesZip(this.month, this.year);
        filename = `comprobantes_${this.year}-${pad}.zip`;
        break;
      case 'compras-zip':
        obs = this.exportService.exportComprasZip(this.month, this.year);
        filename = `compras_${this.year}-${pad}.zip`;
        break;
      case 'ventas':
      default:
        obs = this.exportService.exportVentas(this.month, this.year, this.filtroTipo, this.filtroMetodo);
        filename = `ventas_${this.year}-${pad}${sufTipo}${sufMet}.csv`;
        break;
    }
    this.downloading = true;
    obs.pipe(finalize(() => (this.downloading = false))).subscribe({
      next: (blob: Blob) => {
        this.exportService.saveBlob(esBlob(blob) ? blob : new Blob([blob]), filename);
        this.context.completeWith(true);
      },
      error: (err: { status?: number }) => {
        const status = err?.status ?? 0;
        alert(
          status === 401 ? 'Tu sesión venció. Vuelve a iniciar sesión e inténtalo de nuevo.'
          : status === 403 ? 'No tienes permiso para esta descarga. Pide a tu administrador que te habilite Exportar o Backups.'
          : status === 404 ? 'El backend no tiene estos endpoints. Reinicia el servidor backend con el código actualizado.'
          : status >= 500 ? 'Error en el servidor al generar el archivo. Revisa el log del backend.'
          : 'No se pudo descargar. Revisa tu conexión e inténtalo de nuevo.'
        );
      },
    });
  }
}
