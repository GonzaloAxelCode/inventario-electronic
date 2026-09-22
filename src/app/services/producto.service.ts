import { Producto } from '@/app/models/producto.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
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
            catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }



    getProducto(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.siteURL}/productos/${id}/`).pipe(
            catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }
    createProducto(producto: FormData): Observable<Producto> {
        return this.http.post<Producto>(
            `${this.siteURL}/productos/create/`,
            producto
        ).pipe(
            catchError(error => {
                console.error(error);
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
            catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }
    updateProducto(producto: FormData): Observable<Producto> {
        const id = producto.get('id');
        if (!id) {
            return throwError(() => new Error('Product ID is required'));
        }

        // Create a new FormData for the request to avoid modifying the original
        const requestData = new FormData();
        
        // Copy all fields from the original FormData
        producto.forEach((value, key) => {
            requestData.append(key, value);
        });
        
        // Remove ID from body since it's in the URL
        requestData.delete('id');
        
        // Send PUT request to the correct endpoint
        return this.http.put<Producto>(`${this.siteURL}/productos/update/${id}/`, requestData).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    deactivateProducto(id: number, activo: boolean): Observable<any> {
        return this.http.patch(`${this.siteURL}/productos/update/${id}/`, { activo }).pipe(
            catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }


    deleteProducto(id: number): Observable<any> {
        return this.http.delete(`${this.siteURL}/productos/delete/${id}/`).pipe(
            catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }
}
