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
    getVentasHoy(): Observable<{ results: any[] }> {
        return this.http.get<{ results: any[] }>(
            `${this.siteURL}/ventas/hoy/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener ventas de hoy', error);
                return throwError(error);
            })
        );
    }
    getVentasPorRangoFechasTienda(fromDate: Date, toDate: Date): Observable<{ salesDateRangePerDay: Array<[string, number]> }> {
        const rangeDates = {
            from_date: [fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()],
            to_date: [toDate.getFullYear(), toDate.getMonth(), toDate.getDate()],

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

        year,
        month,
        day,
        tipo
    }: any
    ): Observable<{ todaySales: number, thisMonthSales: number, tipo: string }> {

        const requestPayload = {

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
    getTopProductosMasVendidosHoy(): Observable<{ topProductoMostSales: ProductsSales[] }> {
        return this.http.post<{ topProductoMostSales: ProductsSales[] }>(
            `${this.siteURL}/ventas/top-productos-vendidos-hoy/`,
            {}
        ).pipe(
            catchError(error => {
                console.error('Error al obtener los productos más vendidos', error);
                return throwError(error);
            })
        );
    }
    getVentasPorTienda(

        from_date: [number, number, number],
        to_date: [number, number, number],
        page: number = 1,
        page_size: number = 30
    ): Observable<VentaResponse> {

        // Construir los query params
        let params = new HttpParams()

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
    createVenta(venta: CreateVenta): Observable<Venta> {
        return this.http.post<Venta>(`${this.siteURL}/ventas/crear/`, venta).pipe(
            catchError(error => {
                console.error('Error al crear la venta', error);
                return throwError(error);
            })
        );
    }
    createVentaPendiente(venta: CreateVenta): Observable<Venta> {
        return this.http.post<Venta>(`${this.siteURL}/ventas/crear/pendiente/`, venta).pipe(
            catchError(error => {
                console.error('Error al crear la venta', error);
                return throwError(error);
            })
        );
    }
    createVentaAnonima(venta: CreateVenta): Observable<Venta> {
        return this.http.post<Venta>(`${this.siteURL}/ventas/crear/anonima/`, venta).pipe(
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


    obtenerResumenVentas(): Observable<any> {
        return this.http.post<any>(
            `${this.siteURL}/ventas/resumen/`,
            {}
        ).pipe(
            catchError(error => {
                console.error('Error al obtener resumen de ventas', error);
                return throwError(error);
            })
        );
    }
    fetchSearchVentas(query: Partial<QuerySearchVenta>, page: number, page_size: number): Observable<any> {
        const params = new HttpParams()
            .set('page', page)
            .set('page_size', page_size);
        return this.http.post<VentaResponse>(`${this.siteURL}/ventas/search/`, {

            query,

        }, { params }).pipe(
            catchError(error => throwError(error))
        );
    }


    anularVenta(ventaId: number, motivo: string, tipo_motivo: string): Observable<any> {
        const body = {
            venta_id: ventaId,
            motivo: motivo,
            tipo_motivo: tipo_motivo // Ejemplo: "01" → Anulación de la operación
        };

        return this.http.post<any>(
            `${this.siteURL}/nota-credito/registrar/`,
            body
        ).pipe(
            catchError(error => {
                console.error('Error al anular la venta', error);
                return throwError(() => error);
            })
        );
    }

    generarComprobanteVenta(ventaId: number): Observable<any> {
        const body = {
            venta_id: ventaId
        };

        return this.http.post<any>(
            `${this.siteURL}/ventas/generar-comprobante/`,
            body
        ).pipe(
            catchError(error => {
                console.error('Error al generar el comprobante', error);
                return throwError(() => error);
            })
        );
    }

}
