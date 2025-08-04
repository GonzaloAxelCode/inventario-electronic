import { Inventario } from '@/app/models/inventario.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { printError } from './utils/print-errors';
export interface PaginationPage {
    page_size?: number
    page?: number
}
export interface QuerySearchInventario {
    nombre?: string;
    categoria?: string;
    activo?: any;
}

interface PaginationInventariosResponse {
    count: number,
    next: any,
    previous: any,
    results: Inventario[],
    index_page: any
    length_pages: any
    search_products_found: boolean
}
@Injectable({
    providedIn: 'root',
})
export class InventarioService {
    private siteURL = URL_BASE + '/api';
    private http = inject(HttpClient);
    fetchSearchInventarios(query: QuerySearchInventario, page: number, page_size: number, tiendaId: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page)
            .set('page_size', page_size);
        return this.http.post<PaginationInventariosResponse>(`${this.siteURL}/buscar-inventario/`, { tienda: tiendaId, query }, { params }).pipe(
            catchError(error => throwError(error))
        );
    }
    fetchInventariosPorTienda(tiendaId: number, page: number, page_size: number): Observable<PaginationInventariosResponse> {
        return this.http.get<PaginationInventariosResponse>(
            `${this.siteURL}/inventarios/?tienda_id=${tiendaId}&page=${page}&page_size=${page_size}`
        ).pipe(
            catchError(error => throwError(error))
        );
    }
    createInventario(inventario: Partial<Inventario>): Observable<Inventario> {
        return this.http.post<Inventario>(`${this.siteURL}/inventarios/create/`, inventario).pipe(
            catchError(error => {
                printError(error)
                return throwError(error)
            })
        );
    }


    updateStock(inventarioId: number, cantidad: number): Observable<any> {
        return this.http.patch(`${this.siteURL}/inventarios/actualizar-stock/${inventarioId}/`, { cantidad }).pipe(
            catchError(error => throwError(error))
        );
    }


    actualizarInventario(inventarioUpdated: Partial<Inventario>): Observable<any> {
        return this.http.patch(`${this.siteURL}/inventarios/actualizar/${inventarioUpdated.id}/`, inventarioUpdated).pipe(
            catchError(error => throwError(error))
        );
    }


    verificarStock(inventarioId: number): Observable<any> {
        return this.http.get(`${this.siteURL}/inventarios/verificar-stock/${inventarioId}/`).pipe(
            catchError(error => throwError(error))
        );
    }
    eliminarInventario(inventarioId: number): Observable<any> {
        return this.http.delete(`${this.siteURL}/inventarios/eliminar/${inventarioId}/`).pipe(
            catchError(error => throwError(error))
        );
    }
}
