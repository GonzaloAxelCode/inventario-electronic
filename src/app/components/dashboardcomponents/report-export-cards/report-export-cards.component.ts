import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { TuiButton, TuiDataList, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiSelectModule } from '@taiga-ui/legacy';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { ExportOptionsDialogComponent } from './export-options-dialog.component';
import { TipoExportacion } from './report-export-types';

type Requiere = 'export' | 'backup' | 'either';

interface ExportItem {
  tipo: TipoExportacion;
  titulo: string;
  desc: string;
  requiere: Requiere;
}

interface ExportGroup {
  id: string;
  titulo: string;
  desc: string;
  span: string;
  items: ExportItem[];
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-report-export-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiButton, TuiDataList, TuiTextfield, TuiSelectModule],
  templateUrl: './report-export-cards.component.html',
  styleUrl: './report-export-cards.component.scss',
})
export class ReportExportCardsComponent {
  private readonly store = inject(Store<AppState>);
  private readonly dialogs = inject(TuiDialogService);

  perms$ = this.store.select(selectCurrenttUser).pipe(map((u) => u?.permissions));
  user$ = this.store.select(selectCurrenttUser);

  meses = MESES;
  currentYear = new Date().getFullYear();
  years = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  month = new Date().getMonth() + 1;
  year = this.currentYear;

  groups: ExportGroup[] = [
    {
      id: 'dinero',
      titulo: 'Cuánto gané',
      desc: 'Tu utilidad y tus ventas, para decidir con números',
      span: 'lg:col-span-7',
      items: [
        { tipo: 'ganancias', titulo: 'Ganancias del mes', desc: 'Venta, costo y margen por ticket o producto', requiere: 'export' },
        { tipo: 'ventas', titulo: 'Ventas del mes', desc: 'Detalle para conciliar tu caja', requiere: 'export' },
        { tipo: 'mensual', titulo: 'Ventas del año', desc: 'Mes por mes para ponerte metas', requiere: 'export' },
        { tipo: 'metodos-pago', titulo: 'Cómo te pagan', desc: 'Yape, efectivo, tarjeta y su peso', requiere: 'export' },
      ],
    },
    {
      id: 'que-vende',
      titulo: 'Qué me deja plata',
      desc: 'En qué concentrar tus compras',
      span: 'lg:col-span-5',
      items: [
        { tipo: 'top-productos', titulo: 'Productos que más rotan', desc: 'Cantidad e ingresos por producto', requiere: 'export' },
        { tipo: 'top-categorias', titulo: 'Categorías que más ingresan', desc: 'Dónde está tu mejor vitrina', requiere: 'export' },
      ],
    },
    {
      id: 'amarrado',
      titulo: 'Cuánta plata tengo amarrada',
      desc: 'Tu dinero en estantería',
      span: 'lg:col-span-5',
      items: [
        { tipo: 'inventario', titulo: 'Inventario valorizado', desc: 'Stock actual con costo y proveedor', requiere: 'backup' },
        { tipo: 'stock-bajo', titulo: 'Qué reponer', desc: 'En mínimo o menos, con faltante', requiere: 'either' },
      ],
    },
    {
      id: 'clientes-respaldo',
      titulo: 'Clientes y contador',
      desc: 'Quiénes vuelven y papeles en regla',
      span: 'lg:col-span-7',
      items: [
        { tipo: 'clientes', titulo: 'Clientes del mes', desc: 'Quién compró y quién es recurrente', requiere: 'export' },
        { tipo: 'clientes-tabla', titulo: 'Padrón de clientes', desc: 'Base completa para ofertas y cobranza', requiere: 'backup' },
        { tipo: 'comprobantes-zip', titulo: 'Respaldo de comprobantes', desc: 'XML de ventas del mes (contador)', requiere: 'backup' },
        { tipo: 'compras-zip', titulo: 'Respaldo de compras', desc: 'XML de compras del mes (contador)', requiere: 'backup' },
      ],
    },
  ];

  get periodoLabel(): string {
    return `${MESES[this.month - 1]} ${this.year}`;
  }

  puedeVerItem(requiere: Requiere, perms: { can_export_data?: boolean; can_make_backup?: boolean } | null, esPropietario: boolean, isSuperuser: boolean): boolean {
    if (esPropietario || isSuperuser) return true;
    if (!perms) return false;
    if (requiere === 'export') return !!perms.can_export_data;
    if (requiere === 'backup') return !!perms.can_make_backup;
    return !!(perms.can_export_data || perms.can_make_backup);
  }

  openExport(tipo: TipoExportacion): void {
    const content = new PolymorpheusComponent(ExportOptionsDialogComponent);
    const label = tipo.endsWith('-zip') ? 'Respaldo para contador' : tipo === 'inventario' ? 'Inventario valorizado' : 'Exportar a CSV';
    this.dialogs.open(content, {
      label,
      size: 'm',
      dismissible: true,
      data: { tipo, month: this.month, year: this.year },
    }).subscribe();
  }
}
