import {
    CompraResponse,
    GuardarCompraRequest,
    GuardarSunatResponse,
    QuerySearchCompra,
    ValidarCompraRequest,
    ValidarCompraResponse,
} from '@/app/models/compra.models';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { REQUEST_TIMEOUT_MS } from './utils/http-timeout';
import { URL_BASE } from './utils/endpoints';

@Injectable({
    providedIn: 'root',
})
export class CompraService {
    private siteURL = URL_BASE + '/api';
    private http = inject(HttpClient);

    private readonly VALIDAR_URL = `${this.siteURL}/compra/validar/`;
    private readonly GUARDAR_SUNAT_URL = `${this.siteURL}/compra/guardar/`;
    private readonly GUARDAR_URL = `${this.siteURL}/compras/guardar/`;
    private readonly LISTA_URL = `${this.siteURL}/compras/lista/`;
    private readonly DETALLE_URL = (id: number) => `${this.siteURL}/compras/${id}/`;
    private readonly ELIMINAR_URL = (id: number) => `${this.siteURL}/compras/eliminar/${id}/`;

    /** Valida el comprobante contra SUNAT. No guarda nada. */
    validarCompra(body: ValidarCompraRequest): Observable<ValidarCompraResponse> {
        return this.http.post<ValidarCompraResponse>(this.VALIDAR_URL, body).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al validar comprobante de compra', error);
                return throwError(() => error);
            })
        );
    }

    /** Valida contra SUNAT y guarda solo el XML del CDR en R2. */
    guardarEnSunat(body: ValidarCompraRequest): Observable<GuardarSunatResponse> {
        return this.http.post<GuardarSunatResponse>(this.GUARDAR_SUNAT_URL, body).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al guardar comprobante en SUNAT', error);
                return throwError(() => error);
            })
        );
    }

    /** Persiste el registro mínimo (datos + xml_url) en el backend. */
    guardarCompra(body: GuardarCompraRequest): Observable<any> {
        return this.http.post(this.GUARDAR_URL, body).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al guardar compra', error);
                return throwError(() => error);
            })
        );
    }

    /** GET /api/compras/lista/?page=&page_size=&q=&tipo_comprobante=&numero_comprobante=&proveedor_id= */
    getCompras(
        page: number = 1,
        page_size: number = 10,
        filtros?: QuerySearchCompra
    ): Observable<CompraResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', page_size.toString());

        if (filtros) {
            for (const key of ['q', 'tipo_comprobante', 'numero_comprobante', 'proveedor_id'] as const) {
                const v = filtros[key];
                if (v !== undefined && v !== null && v !== '') {
                    params = params.set(key, String(v));
                }
            }
        }

        return this.http.get<CompraResponse>(this.LISTA_URL, { params }).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al obtener compras', error);
                return throwError(() => error);
            })
        );
    }

    getCompra(id: number): Observable<any> {
        return this.http.get(this.DETALLE_URL(id)).pipe(
            timeout(30000),
            catchError((error) => throwError(() => error))
        );
    }

    eliminarCompra(id: number): Observable<any> {
        return this.http.delete(this.ELIMINAR_URL(id)).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al eliminar compra', error);
                return throwError(() => error);
            })
        );
    }

    /** Sube/actualiza el PDF y/o el XML del proveedor. POST multipart compras/<id>/archivos/ (hasta 120s). */
    subirArchivos(id: number, files: { pdf?: File | null; xml?: File | null }): Observable<any> {
        const fd = new FormData();
        if (files.pdf) fd.append('pdf', files.pdf, files.pdf.name);
        if (files.xml) fd.append('xml', files.xml, files.xml.name);

        const context = new HttpContext().set(REQUEST_TIMEOUT_MS, 120000);
        return this.http.post(`${this.siteURL}/compras/${id}/archivos/`, fd, { context }).pipe(
            catchError((error) => {
                console.error('Error al subir archivos de compra', error);
                return throwError(() => error);
            })
        );
    }
}
