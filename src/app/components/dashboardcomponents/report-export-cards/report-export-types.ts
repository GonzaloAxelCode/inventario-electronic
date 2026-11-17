import { ReportExportService } from '@/app/services/report-export.service';

export type TipoExportacion =
  | 'ventas' | 'mensual' | 'ganancias'
  | 'top-productos' | 'top-categorias' | 'metodos-pago'
  | 'clientes' | 'clientes-tabla' | 'inventario' | 'stock-bajo'
  | 'comprobantes-zip' | 'compras-zip';

export { ReportExportService };
