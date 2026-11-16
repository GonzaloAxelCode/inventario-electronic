import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CelularQuery, CelularesPorMarcaResponse, CelularesResponse, CelularesTopCostoResponse } from '@/app/models/celular.models';
import { URL_BASE } from './utils/endpoints';

@Injectable({ providedIn: 'root' })
export class CelularService {
  private siteURL = URL_BASE + '/api';
  private http = inject(HttpClient);

  list(query: CelularQuery = {}): Observable<CelularesResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    if (!params.has('page')) params = params.set('page', '1');
    if (!params.has('page_size')) params = params.set('page_size', '10');
    return this.http.get<CelularesResponse>(`${this.siteURL}/celulares/`, { params }).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  fetchPorMarca(): Observable<CelularesPorMarcaResponse> {
    return this.http.get<CelularesPorMarcaResponse>(`${this.siteURL}/celulares/por-marca/`).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  fetchTopCostoCompra(tipo: 'compra' | 'venta' = 'compra'): Observable<CelularesTopCostoResponse> {
    const params = new HttpParams().set('tipo', tipo);
    return this.http.get<CelularesTopCostoResponse>(`${this.siteURL}/celulares/top-costo-compra/`, { params }).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  create(payload: FormData | Record<string, unknown>): Observable<any> {
    return this.http.post(`${this.siteURL}/celulares/create/`, payload).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  update(id: number, payload: FormData | Record<string, unknown>): Observable<any> {
    return this.http.put(`${this.siteURL}/celulares/update/${id}/`, payload).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.siteURL}/celulares/delete/${id}/`).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  toggleActive(id: number, activo: boolean): Observable<any> {
    return this.http.patch(`${this.siteURL}/celulares/active/${id}/`, { activo }).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }
}
