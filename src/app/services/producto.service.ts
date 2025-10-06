import { Producto, ProductoCreate } from '@/app/models/producto.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { printError } from './utils/print-errors';
export interface PaginationPage {
    page_size?: number
    page?: number
}
export interface PaginationResponse {
    count: number,
    next: any,
    previous: any,
    results: Producto[],
    index_page: any
    length_pages: any
    search_products_found: boolean,
    all_results: Producto[],
}
@Injectable({
    providedIn: 'root',
})
export class ProductoService {
    private siteURL = URL_BASE + "/api";
    private http = inject(HttpClient);
    fetchLoadProductos(): Observable<PaginationResponse> {
        return this.http.get<PaginationResponse>(`${this.siteURL}/productos/`).pipe(
            catchError(error => throwError(error))
        );
    }


    getProducto(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.siteURL}/productos/${id}/`).pipe(
            catchError(error => throwError(error))
        );
    }

    createProducto(producto: ProductoCreate): Observable<Producto> {
        return this.http.post<Producto>(`${this.siteURL}/productos/create/`, { ...producto }).pipe(
            catchError(error => {
                printError(error);
                return throwError(error);
            })
        );
    }

    updateProducto(producto: Producto): Observable<Producto> {
        return this.http.put<Producto>(`${this.siteURL}/productos/update/${producto.id}/`, producto).pipe(
            catchError(error => {
                printError(error);
                return throwError(error);
            })
        );
    }

    deactivateProducto(id: number, activo: boolean): Observable<any> {
        return this.http.patch(`${this.siteURL}/productos/update/${id}/`, { activo }).pipe(
            catchError(error => throwError(error))
        );
    }


    deleteProducto(id: number): Observable<any> {
        return this.http.delete(`${this.siteURL}/productos/delete/${id}/`).pipe(
            catchError(error => throwError(error))
        );
    }
}
