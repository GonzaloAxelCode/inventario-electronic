import { Pedido, PedidoResponse, PedidoSearchFilters, PedidoSearchResponse, CreatePedido } from '@/app/models/pedido.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';

@Injectable({
    providedIn: 'root',
})
export class PedidoService {
    private siteURL = URL_BASE + '/api';
    private http = inject(HttpClient);

    getPedidos(fromDate: string, toDate: string): Observable<PedidoResponse> {
        return this.http.post<PedidoResponse>(`${this.siteURL}/pedidos/lista/`, {
            from_date: fromDate,
            to_date: toDate,
        }).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al obtener pedidos', error);
                return throwError(() => error);
            })
        );
    }

    buscarPedidos(
        page: number = 1,
        page_size: number = 10,
        filters: PedidoSearchFilters = {}
    ): Observable<PedidoSearchResponse> {
        return this.http.post<PedidoSearchResponse>(`${this.siteURL}/pedidos/buscar/`, {
            page,
            page_size,
            query: filters,
        }).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al buscar pedidos', error);
                return throwError(() => error);
            })
        );
    }

    crearPedido(pedido: CreatePedido): Observable<any> {
        return this.http.post(`${this.siteURL}/pedidos/crear/`, pedido).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al crear pedido', error);
                return throwError(() => error);
            })
        );
    }

    cancelarPedido(pedidoId: number): Observable<any> {
        return this.http.put(`${this.siteURL}/pedidos/cancelar/${pedidoId}/`, {}).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al cancelar pedido', error);
                return throwError(() => error);
            })
        );
    }
}
