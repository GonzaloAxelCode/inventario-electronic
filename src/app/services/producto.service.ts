import { Producto } from '@/app/models/producto.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { printError } from './utils/print-errors';
import { QuerySearchProduct } from './utils/querys';
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
    fetchLoadProductos(page: number, page_size: number): Observable<PaginationResponse> {
        return this.http.get<PaginationResponse>(`${this.siteURL}/productos/?page=${page}&page_size=${page_size}`).pipe(
            catchError(error => throwError(error))
        );
    }



    getProducto(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.siteURL}/productos/${id}/`).pipe(
            catchError(error => throwError(error))
        );
    }
    createProducto(producto: FormData): Observable<Producto> {
        return this.http.post<Producto>(
            `${this.siteURL}/productos/create/`,
            producto
        ).pipe(
            catchError(error => {
                printError(error);
                return throwError(error);
            })
        );
    }

    searchProducts(query: QuerySearchProduct, page: number, page_size: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page)
            .set('page_size', page_size);
        return this.http.post<PaginationResponse>(
            `${this.siteURL}/productos/buscar-producto/`,
            { ...query },
            { params }
        ).pipe(
            catchError(error => throwError(error))
        );
    }
    updateProducto(producto: FormData): Observable<Producto> {
        return this.http.put<Producto>(`${this.siteURL}/productos/update/${producto.get('id')}/`, producto).pipe(
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
