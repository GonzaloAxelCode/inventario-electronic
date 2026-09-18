import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';

export interface GananciasRangoResponse {
  ganancia_hoy: number;
  ganancia_7dias: number;
  ganancia_mes: number;
}

export interface TopProductoMargen {
  producto_id: number;
  nombre: string;
  sku: string;
  unidades: number;
  venta_total: number;
  costo_total: number;
  ganancia_soles: number;
  margen_porcentual: number;
  markup_porcentual: number;
  posicion: number;
}

export interface TopProductosMargenResponse {
  fecha_inicio?: string;
  fecha_fin?: string;
  month?: number;
  year?: number;
  nota?: string;
  total_productos: number;
  items_sin_costo: number;
  productos: TopProductoMargen[];
}

export interface TopProductoMesCategoria {
  categoria_id: number;
  nombre: string;
  color?: string | null;
}

export interface TopProductoMes {
  posicion: number;
  producto_id: number;
  nombre: string;
  imagen?: string | null;
  categoria?: TopProductoMesCategoria | null;
  cantidad_vendida: number;
  total_facturado: number;
  ganancia_neta: number;
  descuentos_totales: number;
}

export interface TopProductosMesResponse {
  month: number;
  year: number;
  ganancia_mes_soles?: number;
  total_productos: number;
  items_sin_costo?: number;
  productos: TopProductoMes[];
}

@Injectable({
  providedIn: 'root',
})
export class GananciaService {
  private siteURL = URL_BASE + '/api';
  private http = inject(HttpClient);

  getGananciasRango(body?: {
    fecha?: string;
    month?: number;
    year?: number;
  }): Observable<GananciasRangoResponse> {
    return this.http
      .post<GananciasRangoResponse>(`${this.siteURL}/ganancias/rango/`, body ?? {})
      .pipe(
        catchError((error) => {
          console.error('Error al obtener ganancias', error);
          return throwError(() => error);
        })
      );
  }

  getTopProductosMargen(month: number, year: number): Observable<TopProductosMargenResponse> {
    return this.http
      .post<TopProductosMargenResponse>(`${this.siteURL}/ganancias/top-productos-margen/`, { month, year })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener top productos por margen', error);
          return throwError(() => error);
        })
      );
  }

  getTopProductosMes(month: number, year: number): Observable<TopProductosMesResponse> {
    return this.http
      .post<TopProductosMesResponse>(`${this.siteURL}/ganancias/top-productos-mes/`, { month, year })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener top productos del mes', error);
          return throwError(() => error);
        })
      );
  }
}
