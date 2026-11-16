import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { finalize, Observable } from 'rxjs';
import { ReportExportService } from '@/app/services/report-export.service';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';

export type TipoExportacion =
  | 'ventas' | 'mensual' | 'ganancias'
  | 'top-productos' | 'top-categorias' | 'metodos-pago'
  | 'clientes' | 'anuladas' | 'stock-bajo';

const INFO: Record<TipoExportacion, { titulo: string; desc: string }> = {
  ventas: { titulo: 'Exportar ventas del mes', desc: 'Detalle de ventas del mes elegido en CSV' },
  mensual: { titulo: 'Exportar ventas del año', desc: 'Totales de enero a diciembre en CSV' },
  ganancias: { titulo: 'Exportar ganancias del mes', desc: 'Resumen o detalle del mes elegido en CSV' },
  'top-productos': { titulo: 'Exportar top productos', desc: 'Más vendidos del mes con Tipo Accesorio/Celular' },
  'top-categorias': { titulo: 'Exportar top categorías', desc: 'Categorías con más ingresos del mes' },
  'metodos-pago': { titulo: 'Exportar métodos de pago', desc: 'Ventas por método de pago del mes' },
  clientes: { titulo: 'Exportar clientes del mes', desc: 'Compras, total y condición Nuevo/Recurrente' },
  anuladas: { titulo: 'Exportar ventas anuladas', desc: 'Anuladas del mes elegido en CSV' },
  'stock-bajo': { titulo: 'Exportar stock bajo', desc: 'Productos en mínimo o menos, con faltante' },
};

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const METODOS_PAGO = ['todos', 'Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta'];

@Component({
  selector: 'app-report-export-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-export-cards.component.html',
  styleUrl: './report-export-cards.component.scss',
})
export class ReportExportCardsComponent {
  private readonly exportService = inject(ReportExportService);
  private readonly store = inject(Store<AppState>);

  perms$ = this.store.select(selectCurrenttUser).pipe(map((u) => u?.permissions));

  meses = MESES;
  metodosPago = METODOS_PAGO;
  currentYear = new Date().getFullYear();
  years = [this.currentYear, this.currentYear - 1, this.currentYear - 2];

  modalOpen = false;
  downloading = false;
  tipo: TipoExportacion = 'ventas';
  month = new Date().getMonth() + 1;
  year = this.currentYear;
  detalleGanancias: 'venta' | 'producto' = 'venta';
  filtroTipo: 'todos' | 'accesorio' | 'celular' = 'todos';
  filtroMetodo = 'todos';
  filtroGrupo: 'todos' | 'accesorios' | 'repuestos' = 'todos';

  get titulo(): string {
    return INFO[this.tipo].titulo;
  }

  get descripcion(): string {
    return INFO[this.tipo].desc;
  }

  get necesitaMes(): boolean {
    return this.tipo === 'ventas' || this.tipo === 'ganancias'
      || this.tipo === 'top-productos' || this.tipo === 'top-categorias'
      || this.tipo === 'metodos-pago' || this.tipo === 'clientes' || this.tipo === 'anuladas';
  }

  get necesitaYear(): boolean {
    return this.necesitaMes || this.tipo === 'mensual';
  }

  get necesitaTipo(): boolean {
    return this.tipo === 'ventas' || this.tipo === 'ganancias'
      || this.tipo === 'top-productos' || this.tipo === 'top-categorias'
      || this.tipo === 'metodos-pago' || this.tipo === 'mensual' || this.tipo === 'anuladas';
  }

  get necesitaMetodo(): boolean {
    return this.tipo === 'ventas' || this.tipo === 'ganancias'
      || this.tipo === 'clientes' || this.tipo === 'anuladas';
  }

  get necesitaGrupo(): boolean {
    return this.tipo === 'stock-bajo';
  }

  openModal(tipo: TipoExportacion): void {
    this.tipo = tipo;
    this.filtroTipo = 'todos';
    this.filtroMetodo = 'todos';
    this.filtroGrupo = 'todos';
    this.modalOpen = true;
  }

  closeModal(): void {
    if (!this.downloading) this.modalOpen = false;
  }

  descargar(): void {
    const pad = String(this.month).padStart(2, '0');
    const sufTipo = this.filtroTipo !== 'todos' ? `_${this.filtroTipo}` : '';
    const sufMet = this.filtroMetodo !== 'todos' ? `_${this.filtroMetodo.toLowerCase()}` : '';
    let obs: Observable<Blob>;
    let filename: string;
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
      case 'anuladas':
        obs = this.exportService.exportAnuladas(this.month, this.year, this.filtroTipo, this.filtroMetodo);
        filename = `anuladas_${this.year}-${pad}${sufTipo}${sufMet}.csv`;
        break;
      case 'stock-bajo': {
        const sufGrupo = this.filtroGrupo !== 'todos' ? `_${this.filtroGrupo}` : '';
        obs = this.exportService.exportStockBajo(this.filtroGrupo);
        filename = `stock_bajo${sufGrupo}.csv`;
        break;
      }
      case 'ventas':
      default:
        obs = this.exportService.exportVentas(this.month, this.year, this.filtroTipo, this.filtroMetodo);
        filename = `ventas_${this.year}-${pad}${sufTipo}${sufMet}.csv`;
        break;
    }
    this.downloading = true;
    obs.pipe(finalize(() => (this.downloading = false))).subscribe({
      next: (blob) => {
        this.exportService.saveBlob(blob, filename);
        this.modalOpen = false;
      },
      error: (err) => {
        console.error('Error al descargar CSV', err);
        const status = err?.status;
        alert(
          status === 401 ? 'Tu sesión venció. Vuelve a iniciar sesión e inténtalo de nuevo.'
          : status === 403 ? 'No tienes permiso para exportar. Pide a tu administrador que te habilite «Exportar datos a CSV».'
          : status === 404 ? 'El backend no tiene estos endpoints. Reinicia el servidor backend con el código actualizado.'
          : status >= 500 ? 'Error en el servidor al generar el CSV. Revisa el log del backend.'
          : 'No se pudo descargar el CSV. Revisa tu conexión e inténtalo de nuevo.'
        );
      },
    });
  }
}
