import { CreateVenta, Venta } from '@/app/models/venta.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductsSales } from '../state/reducers/venta.reducer';
import { QuerySearchVenta } from './caja.service';
import { URL_BASE } from './utils/endpoints';
export interface VentaResponse {
    count: number;
    next: string;
    previous: string;
    results: Venta[];
    index_page: number
    length_pages: number
}

@Injectable({
    providedIn: 'root',
})
export class VentaService {
    private siteURL = URL_BASE + "/api";
    private http = inject(HttpClient);
    getVentasPorRangoFechasTienda(tiendaId: number, fromDate: Date, toDate: Date): Observable<{ salesDateRangePerDay: Array<[string, number]> }> {
        const rangeDates = {
            from_date: [fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()],
            to_date: [toDate.getFullYear(), toDate.getMonth(), toDate.getDate()],
            tienda_id: tiendaId
        };

        return this.http.post<{ salesDateRangePerDay: Array<[string, number]> }>(
            `${this.siteURL}/sales-by-date/`,
            rangeDates
        ).pipe(
            catchError(error => {
                console.error('Error al obtener ventas por rango de fechas', error);
                return throwError(error);
            })
        );
    }

    getResumenVentasByDate({
        tiendaId,
        year,
        month,
        day,
        tipo
    }: any
    ): Observable<{ todaySales: number, thisMonthSales: number, tipo: string }> {

        const requestPayload = {
            tienda_id: tiendaId,
            year,
            month,
            day,
            tipo
        };

        return this.http.post<{ todaySales: number, thisMonthSales: number, tipo: string }>(
            `${this.siteURL}/ventas/resumenbymonthorday/`,
            requestPayload
        ).pipe(
            catchError(error => {
                console.error('Error al obtener resumen de ventas', error);
                return throwError(error);
            })
        );
    }
    getTopProductosMasVendidos(tiendaId: number, fromDate: Date, toDate: Date): Observable<{ topProductoMostSales: ProductsSales[] }> {
        const body = {
            tienda_id: tiendaId,
            from_date: [fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()],
            to_date: [toDate.getFullYear(), toDate.getMonth(), toDate.getDate()]
        };

        return this.http.post<{ topProductoMostSales: ProductsSales[] }>(
            `${this.siteURL}/top-productos-vendidos/`,
            body
        ).pipe(
            catchError(error => {
                console.error('Error al obtener los productos más vendidos', error);
                return throwError(error);
            })
        );
    }
    getVentasPorTienda(
        tiendaId: number,
        from_date: [number, number, number],
        to_date: [number, number, number],
        page: number = 1,
        page_size: number = 5
    ): Observable<VentaResponse> {

        // Construir los query params
        let params = new HttpParams()
            .set('tienda_id', tiendaId.toString())
            .set('page', page.toString())
            .set('page_size', page_size.toString());

        // Función para convertir el array de fecha a string YYYY-MM-DD
        const formatDateArray = (dateArray: [number, number, number]): string => {
            const [year, month, day] = dateArray;
            // Nota: month es 0-based (0=enero, 11=diciembre)
            return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        };


        params = params.set('from_date', formatDateArray(from_date));
        params = params.set('to_date', formatDateArray(to_date));


        return this.http.get<VentaResponse>(`${this.siteURL}/ventas/tienda/`, { params })
            .pipe(
                catchError(error => {
                    console.error('Error al obtener ventas por tienda', error);
                    return throwError(error);
                })
            );
    }
    getLowStockProductsPorTienda(tiendaId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.siteURL}/productos-menor-stock/${tiendaId}/`).pipe(
            catchError(error => {
                console.error('Error al obtener productos con menor stock', error);
                return throwError(error);
            })
        );
    }

    createVenta(venta: CreateVenta): Observable<Venta> {
        return this.http.post<Venta>(`${this.siteURL}/ventas/crear/`, venta).pipe(
            catchError(error => {
                console.error('Error al crear la venta', error);
                return throwError(error);
            })
        );
    }

    cancelarVenta(ventaId: number): Observable<Venta> {
        return this.http.patch<Venta>(`${this.siteURL}/ventas/cancelar/${ventaId}/`, {}).pipe(
            catchError(error => {
                console.error('Error al cancelar la venta', error);
                return throwError(error);
            })
        );
    }


    obtenerResumenVentas(tiendaId: number): Observable<any> {
        return this.http.post<any>(
            `${this.siteURL}/ventas/resumen/`,
            { tienda_id: tiendaId }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener resumen de ventas', error);
                return throwError(error);
            })
        );
    }
    fetchSearchVentas(query: Partial<QuerySearchVenta>, page: number, page_size: number, tienda_id: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page)
            .set('page_size', page_size);
        return this.http.post<VentaResponse>(`${this.siteURL}/ventas/search/`, {
            tienda_id: tienda_id,
            query,

        }, { params }).pipe(
            catchError(error => throwError(error))
        );
    }
}
