import { CreateVenta, Venta } from '@/app/models/venta.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductsSales } from '../state/reducers/venta.reducer';
import { URL_BASE } from './utils/endpoints';

export interface QuerySearchVenta {
    estado: string;
    metodo_pago: string;
    tipo_comprobante: string;
    from_date: [number, number, number];
    to_date: [number, number, number];
    serie: string;
    correlativo: string;
    nombre_cliente: string;
    numero_documento_cliente: string;
    tipo_documento_cliente: string;
    estado_sunat: string;
    numero_comprobante: string;
}

export interface VentaResponse {
    count: number;
    next: string;
    previous: string;
    results: Venta[];
    index_page: number
    length_pages: number
}

export interface MetodoPagoResponse {
    year: number;
    month: number;
    total_ventas: number;
    metodos_pago: {
        metodo_pago: string;
        cantidad: number;
        porcentaje: number;
    }[];
}

export interface SatisfaccionResponse {
    mes_a: { year: number; month: number; ventas: number };
    mes_b: { year: number; month: number; ventas: number };
    porcentaje: number;
    variacion: number;
}

export interface MetodosPagoRangoResponse {
    from_date: [number, number, number];
    to_date: [number, number, number];
    total_general: number;
    total_ventas: number;
    metodos_pago: {
        metodo_pago: string;
        num_ventas: number;
        total_soles: number;
        porcentaje: number;
    }[];
}

export interface TopProductosMesResponse {
    month: number;
    year: number;
    total_productos: number;
    productos: {
        producto_id: number;
        nombre: string;
        sku: string;
        total_unidades: number;
        total_ingresos: number;
    }[];
}

export interface TopCategoriasMesResponse {
    month: number;
    year: number;
    total_categorias: number;
    categorias: {
        categoria_id: number;
        nombre: string;
        codigo: string;
        total_unidades: number;
        total_ingresos: number;
    }[];
}

@Injectable({
    providedIn: 'root',
})
export class VentaService {
    private siteURL = URL_BASE + "/api";
    private http = inject(HttpClient);
    getVentasHoy(): Observable<{ results: any[] }> {
        return this.http.get<{ results: any[] }>(
            `${this.siteURL}/sales/today/`
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
            `${this.siteURL}/sales/date-range/`,
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
            `${this.siteURL}/sales/by-day-month/`,
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
            `${this.siteURL}/sales/top-products/`,
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


        return this.http.get<VentaResponse>(`${this.siteURL}/sales/totals/`, { params })
            .pipe(
                catchError(error => {
                    console.error('Error al obtener ventas por tienda', error);
                    return throwError(error);
                })
            );
    }
    createVenta(venta: CreateVenta): Observable<Venta> {
        return this.http.post<Venta>(`${this.siteURL}/sales/create/`, venta).pipe(
            catchError(error => {
                console.error('Error al crear la venta', error);
                return throwError(error);
            })
        );
    }
    createVentaPendiente(venta: CreateVenta): Observable<Venta> {
        return this.http.post<Venta>(`${this.siteURL}/sales/create/pendiente/`, venta).pipe(
            catchError(error => {
                console.error('Error al crear la venta', error);
                return throwError(error);
            })
        );
    }
    createVentaAnonima(venta: CreateVenta): Observable<Venta> {
        return this.http.post<Venta>(`${this.siteURL}/sales/create/anonima/`, venta).pipe(
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
            `${this.siteURL}/sales/summary/`,
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
        return this.http.post<VentaResponse>(`${this.siteURL}/sales/search/`, {

            query,

        }, { params }).pipe(
            catchError(error => throwError(error))
        );
    }


    anularVenta(ventaId: number, motivo: string, tipo_motivo: string, anonima: boolean): Observable<any> {
        const body = {
            venta_id: ventaId,
            motivo: motivo,
            tipo_motivo: tipo_motivo // Ejemplo: "01" → Anulación de la operación,
            , anonima: anonima
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

    getMetodosPago(year?: number, month?: number): Observable<MetodoPagoResponse> {
        const body: any = {};
        if (year) body.year = year;
        if (month) body.month = month;

        return this.http.post<MetodoPagoResponse>(
            `${this.siteURL}/sales/payment-methods/`,
            body
        ).pipe(
            catchError(error => {
                console.error('Error al obtener métodos de pago', error);
                return throwError(() => error);
            })
        );
    }

    getMetodosPagoPorRango(fromDate: [number, number, number], toDate: [number, number, number]): Observable<MetodosPagoRangoResponse> {
        return this.http.post<MetodosPagoRangoResponse>(
            `${this.siteURL}/reports/payment-methods/`,
            { from_date: fromDate, to_date: toDate }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener métodos de pago por rango', error);
                return throwError(() => error);
            })
        );
    }

    getSatisfaccion(yearA: number, monthA: number, yearB: number, monthB: number): Observable<SatisfaccionResponse> {
        const body = {
            year_a: yearA,
            month_a: monthA,
            year_b: yearB,
            month_b: monthB,
        };

        return this.http.post<SatisfaccionResponse>(
            `${this.siteURL}/sales/satisfaction/`,
            body
        ).pipe(
            catchError(error => {
                console.error('Error al obtener satisfacción', error);
                return throwError(() => error);
            })
        );
    }

    getTopProductsMonth(month: string): Observable<{ year: number; month: number; results: { nombre: string; cantidad_total_vendida: number }[] }> {
        return this.http.post<{ year: number; month: number; results: { nombre: string; cantidad_total_vendida: number }[] }>(
            `${this.siteURL}/sales/top-products-month/`,
            { month }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener top productos', error);
                return throwError(() => error);
            })
        );
    }

    getDailyTrend(days: number = 20): Observable<{ results: { fecha: string; total: number }[] }> {
        return this.http.post<{ results: { fecha: string; total: number }[] }>(
            `${this.siteURL}/sales/daily-trend/`,
            { days }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener tendencia diaria', error);
                return throwError(() => error);
            })
        );
    }

    getReporteMensual(month: number, year: number): Observable<ReporteMensualResponse> {
        return this.http.post<ReporteMensualResponse>(
            `${this.siteURL}/reports/monthly/`,
            { month, year }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener reporte mensual', error);
                return throwError(() => error);
            })
        );
    }

    getTopProductosMes(month: number, year: number): Observable<TopProductosMesResponse> {
        return this.http.post<TopProductosMesResponse>(
            `${this.siteURL}/reports/top-products/`,
            { month, year }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener top productos del mes', error);
                return throwError(() => error);
            })
        );
    }

    getTopCategoriasMes(month: number, year: number): Observable<TopCategoriasMesResponse> {
        return this.http.post<TopCategoriasMesResponse>(
            `${this.siteURL}/reports/top-categories/`,
            { month, year }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener top categorías del mes', error);
                return throwError(() => error);
            })
        );
    }

    getDailySummary(): Observable<DailySummaryResponse> {
        return this.http.get<DailySummaryResponse>(
            `${this.siteURL}/reports/daily-summary/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener resumen del día', error);
                return throwError(() => error);
            })
        );
    }

    getDailyPaymentMethods(): Observable<DailyPaymentMethodsResponse> {
        return this.http.get<DailyPaymentMethodsResponse>(
            `${this.siteURL}/reports/daily-payment-methods/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener métodos de pago del día', error);
                return throwError(() => error);
            })
        );
    }

    getDailyPeakHours(): Observable<DailyPeakHoursResponse> {
        return this.http.get<DailyPeakHoursResponse>(
            `${this.siteURL}/reports/daily-peak-hours/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener horas pico del día', error);
                return throwError(() => error);
            })
        );
    }

    getDailyTopProducts(): Observable<DailyTopProductsResponse> {
        return this.http.get<DailyTopProductsResponse>(
            `${this.siteURL}/reports/daily-top-products/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener top productos del día', error);
                return throwError(() => error);
            })
        );
    }

    getDailyTopCategories(): Observable<DailyTopCategoriesResponse> {
        return this.http.get<DailyTopCategoriesResponse>(
            `${this.siteURL}/reports/daily-top-categories/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener top categorías del día', error);
                return throwError(() => error);
            })
        );
    }

    getDailyRecentSales(): Observable<DailyRecentSalesResponse> {
        return this.http.get<DailyRecentSalesResponse>(
            `${this.siteURL}/reports/daily-recent-sales/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener ventas recientes del día', error);
                return throwError(() => error);
            })
        );
    }

    getDailyCustomers(): Observable<DailyCustomersResponse> {
        return this.http.get<DailyCustomersResponse>(
            `${this.siteURL}/reports/daily-customers/`
        ).pipe(
            catchError(error => {
                console.error('Error al obtener clientes del día', error);
                return throwError(() => error);
            })
        );
    }

    getMonthlyCustomers(month: number, year: number): Observable<MonthlyCustomersResponse> {
        return this.http.post<MonthlyCustomersResponse>(
            `${this.siteURL}/reports/monthly-customers/`,
            { month, year }
        ).pipe(
            catchError(error => {
                console.error('Error al obtener clientes del mes', error);
                return throwError(() => error);
            })
        );
    }
}

export interface ReporteMensualResponse {
    month: number;
    year: number;
    total_ventas: number;
    total_ventas_mes_anterior: number;
    porcentaje_vs_mes_anterior: number;
    num_comprobantes: number;
    clientes_atendidos: number;
}

export interface DailySummaryResponse {
    fecha: string;
    total_ventas: number;
    comprobantes_emitidos: number;
    clientes_atendidos: number;
}

export interface DailyPaymentMethod {
    metodo_pago: string;
    cantidad_transacciones: number;
    total_soles: number;
    porcentaje_transacciones: number;
    porcentaje_monto: number;
}

export interface DailyPaymentMethodsResponse {
    fecha: string;
    total_transacciones: number;
    total_general_soles: number;
    metodos_pago: DailyPaymentMethod[];
}

export interface PeakHour {
    hora: number;
    label: string;
    cantidad_ventas: number;
    total_soles: number;
}

export interface DailyPeakHoursResponse {
    fecha: string;
    hora_pico_ventas: PeakHour;
    hora_pico_monto: PeakHour;
    horas: PeakHour[];
}

export interface TopProduct {
    posicion: number;
    producto_id: number;
    nombre: string;
    sku: string;
    cantidad_vendida: number;
    total_neto: number;
}

export interface DailyTopProductsResponse {
    fecha: string;
    total_productos: number;
    productos: TopProduct[];
}

export interface TopCategoria {
    posicion: number;
    categoria_id: number;
    nombre: string;
    codigo: string;
    color: string;
    total_unidades: number;
    ingreso_neto: number;
}

export interface DailyTopCategoriesResponse {
    fecha: string;
    total_categorias: number;
    categorias: TopCategoria[];
}

export interface RecentSale {
    venta_id: number;
    numero_comprobante: string;
    cliente: string;
    hora: string;
    monto: number;
    cantidad_productos: number;
    metodo_pago: string;
}

export interface DailyRecentSalesResponse {
    fecha: string;
    ventas_recientes: RecentSale[];
}

export interface DailyCustomersResponse {
    fecha: string;
    total_clientes: number;
    clientes_nuevos: number;
    clientes_recurrentes: number;
    porcentaje_nuevos: number;
    porcentaje_recurrentes: number;
    tasa_retencion: number;
}

export interface MonthlyCustomersResponse {
    year: number;
    month: number;
    total_clientes: number;
    clientes_nuevos: number;
    clientes_recurrentes: number;
    porcentaje_nuevos: number;
    porcentaje_recurrentes: number;
    tasa_retencion: number;
}
