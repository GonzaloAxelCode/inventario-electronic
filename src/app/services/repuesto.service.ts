import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RepuestoQuery, RepuestosResponse } from '@/app/models/repuesto.models';
import { URL_BASE } from './utils/endpoints';

@Injectable({ providedIn: 'root' })
export class RepuestoService {
  private siteURL = URL_BASE + '/api';
  private http = inject(HttpClient);

  list(query: RepuestoQuery = {}): Observable<RepuestosResponse> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    if (!params.has('page')) params = params.set('page', '1');
    if (!params.has('page_size')) params = params.set('page_size', '10');
    return this.http.get<RepuestosResponse>(`${this.siteURL}/repuestos/`, { params }).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  create(payload: FormData | Record<string, unknown>): Observable<any> {
    return this.http.post(`${this.siteURL}/repuestos/create/`, payload).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  update(id: number, payload: FormData | Record<string, unknown>): Observable<any> {
    return this.http.put(`${this.siteURL}/repuestos/update/${id}/`, payload).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.siteURL}/repuestos/delete/${id}/`).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }

  toggleActive(id: number, activo: boolean): Observable<any> {
    return this.http.patch(`${this.siteURL}/repuestos/active/${id}/`, { activo }).pipe(
      catchError((e) => { console.error(e); return throwError(() => e); }),
    );
  }
}
