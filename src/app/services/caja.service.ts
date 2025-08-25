import { Caja, OperacionCaja } from '@/app/models/caja.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';

export interface QuerySearchVenta {
    estado: string;
    metodo_pago: string;
    tipo_comprobante: string;
    from_date: [number, number, number]; // [year, month, day]
    to_date: [number, number, number];   // [year, month, day]
    serie: string;
    correlativo: string;
    nombre_cliente: string;
    numero_documento_cliente: string;
    tipo_documento_cliente: string;
    estado_sunat: string;
    numero_comprobante: string
}


@Injectable({
    providedIn: 'root',
})
export class CajaService {
    private siteURL = URL_BASE + '/api';
    private http = inject(HttpClient);

    /**
     * GET /api/caja-abierta/:tienda_id/
     */
    getCajaAbierta(): Observable<{ caja: Caja; operaciones: OperacionCaja[], caja_is_open: boolean }> {
        return this.http
            .get<{ caja: Caja; operaciones: OperacionCaja[]; caja_is_open: boolean }>(
                `${this.siteURL}/caja/`
            )
            .pipe(catchError((error) => throwError(() => error)));
    }

    /**
     * POST /api/create-caja/
     */
    createCaja(saldoInicial: number): Observable<{ caja: Caja; operaciones: OperacionCaja[], caja_is_open: boolean }> {
        const payload = {
            saldo_inicial: saldoInicial,

        };
        return this.http
            .post<{ caja: Caja; operaciones: OperacionCaja[]; caja_is_open: boolean }>(`${this.siteURL}/create-caja/`, payload)
            .pipe(catchError((error) => throwError(() => error)));
    }

    /**
     * POST /api/caja/realizar-gasto/
     */
    realizarGasto(cajaId: number, monto: number, descripcion: string): Observable<{ operacion: OperacionCaja, caja: Caja }> {
        const payload = {
            caja_id: cajaId,
            monto,
            descripcion,

        };
        return this.http
            .post<{ operacion: OperacionCaja, caja: Caja }>(`${this.siteURL}/caja/realizar-gasto/`, payload)
            .pipe(catchError((error) => throwError(() => error)));
    }

    /**
     * POST /api/caja/realizar-ingreso/
     */
    realizarIngreso(cajaId: number, monto: number, descripcion: string): Observable<{ operacion: OperacionCaja, caja: Caja }> {
        const payload = {
            caja_id: cajaId,
            monto,
            descripcion,

        };
        return this.http
            .post<{ operacion: OperacionCaja, caja: Caja }>(`${this.siteURL}/caja/realizar-ingreso/`, payload)
            .pipe(catchError((error) => throwError(() => error)));
    }

    /**
     * POST /api/caja/registrar-prestamo/
     */
    registrarPrestamo(monto: number, descripcion: string): Observable<{ operacion: OperacionCaja, caja: Caja }> {
        const payload = {

            monto,
            descripcion,

        };
        return this.http
            .post<{ operacion: OperacionCaja, caja: Caja }>(`${this.siteURL}/caja/registrar-prestamo/`, payload)
            .pipe(catchError((error) => throwError(() => error)));
    }

    /**
     * POST /api/caja/cerrar/
     */
    cerrarCaja(cajaId: number): Observable<{ caja_is_open: boolean, caja: any, operaciones: any }> {
        const payload = { caja_id: cajaId };
        return this.http
            .post<{ caja_is_open: boolean, caja: any, operaciones: any }>(`${this.siteURL}/caja/cerrar/`, payload)
            .pipe(catchError((error) => throwError(() => error)));
    }

    /**
     * POST /api/caja/reiniciar/
     */
    reinicializarCaja(cajaId: number, saldoInicial: number): Observable<{ caja_is_open: boolean, caja: Caja, operaciones: any }> {
        const payload = { caja_id: cajaId, saldo_inicial: saldoInicial };
        return this.http
            .post<{ caja_is_open: boolean, caja: Caja, operaciones: any }>(`${this.siteURL}/caja/reiniciar/`, payload)
            .pipe(catchError((error) => throwError(() => error)));
    }
}
