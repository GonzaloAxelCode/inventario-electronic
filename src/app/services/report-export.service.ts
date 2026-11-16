import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_BASE } from './utils/endpoints';
import { REQUEST_TIMEOUT_MS } from './utils/http-timeout';

export type GrupoInventario = 'accesorios' | 'celulares' | 'repuestos';

export interface ResumenAnual {
  year: number;
  total_anual: number;
  n_ventas: number;
  mejor_mes: { month: number; nombre: string; total: number; n_ventas: number };
  mejor_dia: { fecha: string | null; total: number; n_ventas: number };
}

@Injectable({ providedIn: 'root' })
export class ReportExportService {
  private base = `${URL_BASE}/api/reports/export`;
  private http = inject(HttpClient);

  private download(url: string, params?: HttpParams): Observable<Blob> {
    // Los Excel/ZIP se generan en el servidor: hasta 120s antes de cancelarse.
    const context = new HttpContext().set(REQUEST_TIMEOUT_MS, 120000);
    return this.http.get(url, { params, responseType: 'blob' as const, context });
  }

  exportInventario(grupo: GrupoInventario): Observable<Blob> {
    return this.download(`${this.base}/inventario/`, new HttpParams().set('grupo', grupo));
  }

  exportVentas(month: number, year: number, tipo = 'todos', metodo = 'todos'): Observable<Blob> {
    const params = new HttpParams().set('month', String(month)).set('year', String(year))
      .set('tipo', tipo).set('metodo_pago', metodo);
    return this.download(`${this.base}/ventas/`, params);
  }

  exportVentasMensual(year: number, tipo = 'todos'): Observable<Blob> {
    return this.download(`${this.base}/ventas-mensual/`, new HttpParams().set('year', String(year)).set('tipo', tipo));
  }

  exportGanancias(month: number, year: number, detalle: 'venta' | 'producto' = 'venta', tipo = 'todos', metodo = 'todos'): Observable<Blob> {
    const params = new HttpParams().set('month', String(month)).set('year', String(year))
      .set('detalle', detalle).set('tipo', tipo).set('metodo_pago', metodo);
    return this.download(`${this.base}/ganancias/`, params);
  }

  exportTopProductos(month: number, year: number, tipo = 'todos'): Observable<Blob> {
    return this.download(`${this.base}/top-productos/`, new HttpParams().set('month', String(month)).set('year', String(year)).set('tipo', tipo));
  }

  exportTopCategorias(month: number, year: number, tipo = 'todos'): Observable<Blob> {
    return this.download(`${this.base}/top-categorias/`, new HttpParams().set('month', String(month)).set('year', String(year)).set('tipo', tipo));
  }

  exportMetodosPago(month: number, year: number, tipo = 'todos'): Observable<Blob> {
    return this.download(`${this.base}/metodos-pago/`, new HttpParams().set('month', String(month)).set('year', String(year)).set('tipo', tipo));
  }

  exportClientes(month: number, year: number, metodo = 'todos'): Observable<Blob> {
    return this.download(`${this.base}/clientes/`, new HttpParams().set('month', String(month)).set('year', String(year)).set('metodo_pago', metodo));
  }

  exportAnuladas(month: number, year: number, tipo = 'todos', metodo = 'todos'): Observable<Blob> {
    const params = new HttpParams().set('month', String(month)).set('year', String(year))
      .set('tipo', tipo).set('metodo_pago', metodo);
    return this.download(`${this.base}/anuladas/`, params);
  }

  exportStockBajo(grupo = 'todos'): Observable<Blob> {
    return this.download(`${this.base}/stock-bajo/`, new HttpParams().set('grupo', grupo));
  }

  getResumenAnual(year: number): Observable<ResumenAnual> {
    return this.http.get<ResumenAnual>(`${this.base}/resumen-anual/`, { params: new HttpParams().set('year', String(year)) });
  }

  exportComprobantesZip(month: number, year: number): Observable<Blob> {
    return this.download(`${this.base}/comprobantes-zip/`, new HttpParams().set('month', String(month)).set('year', String(year)));
  }

  exportComprasZip(month: number, year: number): Observable<Blob> {
    return this.download(`${this.base}/compras-zip/`, new HttpParams().set('month', String(month)).set('year', String(year)));
  }

  exportClientesTabla(): Observable<Blob> {
    return this.download(`${this.base}/clientes-tabla/`);
  }

  saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}
