import { ComprobanteCompra, CreateCompra } from '@/app/models/compra.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';

export interface CompraResponse {
    count: number;
    next: string;
    previous: string;
    index_page: number;
    length_pages: number;
    results: ComprobanteCompra[];
}

@Injectable({
    providedIn: 'root',
})
export class CompraService {
    private siteURL = URL_BASE + '/api';
    private http = inject(HttpClient);

    getComprobantes(page: number = 1, page_size: number = 10): Observable<CompraResponse> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', page_size.toString());

        return this.http.get<CompraResponse>(`${this.siteURL}/compras/comprobante/lista/`, { params }).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al obtener comprobantes de compra', error);
                return throwError(() => error);
            })
        );
    }

    crearComprobante(compra: CreateCompra): Observable<any> {
        const formData = new FormData();
        formData.append('tipo_comprobante', compra.tipo_comprobante);
        formData.append('serie', compra.serie);
        formData.append('correlativo', compra.correlativo);
        formData.append('fecha_emision', compra.fecha_emision);
        formData.append('total', compra.total?.toString() || '0');
        formData.append('igv', compra.igv?.toString() || '0');
        formData.append('moneda', compra.moneda || 'PEN');

        if (compra.fecha_vencimiento) formData.append('fecha_vencimiento', compra.fecha_vencimiento);
        if (compra.forma_pago) formData.append('forma_pago', compra.forma_pago);
        if (compra.gravadas != null) formData.append('gravadas', compra.gravadas.toString());
        if (compra.op_exoneradas != null) formData.append('op_exoneradas', compra.op_exoneradas.toString());
        if (compra.op_inafectas != null) formData.append('op_inafectas', compra.op_inafectas.toString());
        if (compra.op_gratuitas != null) formData.append('op_gratuitas', compra.op_gratuitas.toString());
        if (compra.dctos_totales != null) formData.append('dctos_totales', compra.dctos_totales.toString());
        if (compra.icbper != null) formData.append('icbper', compra.icbper.toString());
        if (compra.observaciones) formData.append('observaciones', compra.observaciones);
        if (compra.items) formData.append('items', JSON.stringify(compra.items));
        if (compra.archivo_xml) formData.append('archivo_xml', compra.archivo_xml);
        if (compra.documento_relacionado) formData.append('documento_relacionado', compra.documento_relacionado);
        if (compra.enlace_verificacion) formData.append('enlace_verificacion', compra.enlace_verificacion);

        if (compra.numero_documento_proveedor) {
            formData.append('tipo_documento_proveedor', compra.tipo_documento_proveedor || '');
            formData.append('numero_documento_proveedor', compra.numero_documento_proveedor);
            formData.append('nombre_proveedor', compra.nombre_proveedor || '');
        }

        return this.http.post(`${this.siteURL}/compras/comprobante/crear/`, formData).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al crear comprobante de compra', error);
                return throwError(() => error);
            })
        );
    }
}
