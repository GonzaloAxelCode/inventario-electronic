import { ComprobanteCompra, ComprobanteFile, CreateCompra, SubirFileResponse, UpdateCompra } from '@/app/models/compra.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';

export interface CompraResponse {
    count: number;
    next: string;
    previous: string;
    index_page: number;
    length_pages: number;
    results: ComprobanteCompra[];
}

export interface ComprobanteFilesResponse {
    results: ComprobanteFile[];
}

/**
 * Filtros combinables — GET query o POST { query: {...} }.
 * Estilo ventas (SalesTotalsView): todos combinables.
 */
export interface QuerySearchCompra {
    tipo_comprobante?: string;
    forma_pago?: string;
    moneda?: string;
    /** Serie-Correlativo, ej: "F001-123". También acepta parcial. */
    numero_comprobante?: string;
    serie?: string;
    correlativo?: string;
    /** Texto libre proveedor (nombre / ruc / numero documento) */
    proveedor?: string;
    con_pdf?: boolean;
    con_xml?: boolean;
    con_imagen?: boolean;
    total_min?: string;
    total_max?: string;
    // ---- legacy (compat: se mapean al nuevo formato) ----
    nombre?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}

export interface ListarComprasPostBody {
    page?: number;
    page_size?: number;
    infinity_scroll?: boolean;
    from_date?: string;
    to_date?: string;
    query?: QuerySearchCompra;
}

@Injectable({
    providedIn: 'root',
})
export class CompraService {
    private siteURL = URL_BASE + '/api';
    private http = inject(HttpClient);

    private readonly LISTA_URL = `${this.siteURL}/compras/lista/`;
    private readonly CREAR_URL = `${this.siteURL}/compras/crear/`;
    private readonly ACTUALIZAR_URL = (id: number) => `${this.siteURL}/compras/actualizar/${id}/`;

    // ================= LISTA (paginación igual a ventas) =================

    /**
     * GET /api/compras/lista/?page=&page_size=&from_date=&to_date=&tipo_comprobante=&...
     * Misma paginación que ventas: count/next/previous/index_page/length_pages/results
     */
    getComprobantes(
        page: number = 1,
        page_size: number = 10,
        filtros?: Partial<QuerySearchCompra> & { from_date?: string; to_date?: string }
    ): Observable<CompraResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', page_size.toString());

        if (filtros) {
            const q = filtros as any;
            // Fechas: acepta from_date/to_date y legacy fecha_desde/fecha_hasta
            const from = q.from_date || q.fecha_desde;
            const to = q.to_date || q.fecha_hasta;
            if (from) params = params.set('from_date', String(from));
            if (to) params = params.set('to_date', String(to));
            // Resto de filtros combinables (solo se envían si tienen valor)
            for (const key of [
                'tipo_comprobante', 'forma_pago', 'moneda', 'numero_comprobante',
                'serie', 'correlativo', 'proveedor', 'nombre',
                'con_pdf', 'con_xml', 'con_imagen', 'total_min', 'total_max',
            ]) {
                const v = q[key];
                if (v !== undefined && v !== null && v !== '') {
                    params = params.set(key, String(v));
                }
            }
        }

        return this.http.get<CompraResponse>(this.LISTA_URL, { params }).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al obtener comprobantes de compra', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * POST /api/compras/lista/ estilo ventas (SalesTotalsView).
     * Body: { page, page_size, infinity_scroll, from_date, to_date, query: {...} }
     * Query params ?page=&page_size= para la paginación (igual que ventas).
     *
     * Ejemplo:
     * {
     *   "page": 1, "page_size": 5, "infinity_scroll": false,
     *   "from_date": "2026-09-01", "to_date": "2026-09-30",
     *   "query": { "tipo_comprobante": "01", "forma_pago": "CONTADO",
     *              "numero_comprobante": "F001-123", "con_pdf": true }
     * }
     */
    listarComprasPost(body: ListarComprasPostBody): Observable<CompraResponse> {
        const page = body.page ?? 1;
        const page_size = body.page_size ?? 10;
        const params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', page_size.toString());

        const payload: any = {
            page,
            page_size,
            infinity_scroll: body.infinity_scroll ?? false,
        };
        if (body.from_date) payload.from_date = body.from_date;
        if (body.to_date) payload.to_date = body.to_date;
        if (body.query) {
            const clean: any = {};
            for (const [k, v] of Object.entries(body.query)) {
                if (v !== undefined && v !== null && v !== '') clean[k] = v;
            }
            payload.query = clean;
        }

        return this.http.post<CompraResponse>(this.LISTA_URL, payload, { params }).pipe(
            timeout(30000),
            catchError((error) => {
                console.error('Error al listar comprobantes de compra (POST)', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Búsqueda con filtros combinables vía POST estilo ventas.
     * Mantiene la firma anterior para no romper callers.
     */
    searchComprobantes(
        query: Partial<QuerySearchCompra>,
        page: number = 1,
        page_size: number = 10,
        from_date?: string,
        to_date?: string
    ): Observable<CompraResponse> {
        // Legacy: fecha_desde/fecha_hasta dentro del query -> from_date/to_date
        const q: any = { ...(query as any) };
        const from = from_date || q.fecha_desde || q.from_date;
        const to = to_date || q.fecha_hasta || q.to_date;
        return this.listarComprasPost({
            page,
            page_size,
            infinity_scroll: false,
            from_date: from || undefined,
            to_date: to || undefined,
            query: q,
        });
    }

    // ================= CREAR (endpoint único) =================

    private buildProveedorPayload(compra: CreateCompra): any | undefined {
        if (compra.proveedor && (compra.proveedor.id || compra.proveedor.nombre || compra.proveedor.numero_documento)) {
            const p = compra.proveedor;
            if (p.id) return { id: p.id };
            const out: any = {};
            if (p.nombre) out.nombre = p.nombre;
            if (p.tipo_documento) out.tipo_documento = p.tipo_documento;
            if (p.numero_documento) out.numero_documento = p.numero_documento;
            return Object.keys(out).length ? out : undefined;
        }
        // Legacy: tipo/numero/nombre_proveedor sueltos
        const tipo = (compra as any).tipo_documento_proveedor;
        const numero = (compra as any).numero_documento_proveedor;
        const nombre = (compra as any).nombre_proveedor;
        if (numero || nombre) {
            const out: any = {};
            if (nombre) out.nombre = nombre;
            if (tipo) out.tipo_documento = tipo;
            if (numero) out.numero_documento = numero;
            return out;
        }
        return undefined;
    }

    private buildItemsPayload(compra: CreateCompra): any[] {
        const items: any[] = (compra.items as any[]) || [];
        return items.map((it: any) => {
            const descripcion = it.descripcion ?? it.producto ?? '';
            const out: any = {
                cantidad: Number(it.cantidad),
                precio_unitario: Number(it.precio_unitario),
                descuento: Number(it.descuento ?? 0),
            };
            if (descripcion) out.descripcion = descripcion;
            if (it.codigo) out.codigo = it.codigo;
            return out;
        });
    }

    private getFiles(compra: CreateCompra): { xml: File | null; pdf: File | null; imagen: File | null } {
        const xml = compra.xml || (compra as any).archivo_xml || null;
        const pdf = compra.pdf || (compra as any).archivo_pdf || null;
        const imagen = compra.imagen || null;
        return { xml, pdf, imagen };
    }

    private buildJsonPayload(compra: CreateCompra): any {
        const payload: any = {
            tipo_comprobante: compra.tipo_comprobante,
            serie: (compra.serie || '').trim().toUpperCase(),
            correlativo: (compra.correlativo || '').trim(),
            fecha_emision: compra.fecha_emision,
            items: this.buildItemsPayload(compra),
        };
        if (compra.fecha_vencimiento) payload.fecha_vencimiento = compra.fecha_vencimiento;
        if (compra.forma_pago) payload.forma_pago = compra.forma_pago;
        if (compra.moneda) payload.moneda = compra.moneda;

        const proveedor = this.buildProveedorPayload(compra);
        if (proveedor) payload.proveedor = proveedor;

        // Si no se envían total + igv, el backend los calcula. Solo enviar si vienen.
        if (compra.total != null) payload.total = Number(compra.total);
        if (compra.igv != null) payload.igv = Number(compra.igv);
        if ((compra as any).gravadas != null) payload.gravadas = Number((compra as any).gravadas);
        if (compra.op_exoneradas != null) payload.op_exoneradas = Number(compra.op_exoneradas);
        if (compra.op_inafectas != null) payload.op_inafectas = Number(compra.op_inafectas);
        if (compra.op_gratuitas != null) payload.op_gratuitas = Number(compra.op_gratuitas);
        if (compra.dctos_totales != null) payload.dctos_totales = Number(compra.dctos_totales);
        if (compra.icbper != null) payload.icbper = Number(compra.icbper);

        if (compra.documento_relacionado !== undefined) payload.documento_relacionado = compra.documento_relacionado;
        if (compra.enlace_verificacion !== undefined) payload.enlace_verificacion = compra.enlace_verificacion;
        if (compra.observaciones !== undefined) payload.observaciones = compra.observaciones;
        if (compra.xml_url !== undefined) payload.xml_url = compra.xml_url;
        if (compra.pdf_url !== undefined) payload.pdf_url = compra.pdf_url;
        if (compra.image_url !== undefined) payload.image_url = compra.image_url;
        return payload;
    }

    private buildMultipartPayload(compra: CreateCompra, files: { xml: File | null; pdf: File | null; imagen: File | null }): FormData {
        const fd = new FormData();
        const json = this.buildJsonPayload(compra);

        fd.append('tipo_comprobante', String(json.tipo_comprobante));
        fd.append('serie', String(json.serie));
        fd.append('correlativo', String(json.correlativo));
        fd.append('fecha_emision', String(json.fecha_emision));
        if (json.fecha_vencimiento) fd.append('fecha_vencimiento', String(json.fecha_vencimiento));
        if (json.forma_pago) fd.append('forma_pago', String(json.forma_pago));
        if (json.moneda) fd.append('moneda', String(json.moneda));
        if (json.proveedor) fd.append('proveedor', JSON.stringify(json.proveedor));
        if (json.items) fd.append('items', JSON.stringify(json.items));
        for (const k of ['total', 'igv', 'gravadas', 'op_exoneradas', 'op_inafectas', 'op_gratuitas', 'dctos_totales', 'icbper']) {
            if (json[k] !== undefined && json[k] !== null) fd.append(k, String(json[k]));
        }
        if (json.documento_relacionado) fd.append('documento_relacionado', String(json.documento_relacionado));
        if (json.enlace_verificacion) fd.append('enlace_verificacion', String(json.enlace_verificacion));
        if (json.observaciones) fd.append('observaciones', String(json.observaciones));
        if (json.xml_url) fd.append('xml_url', String(json.xml_url));
        if (json.pdf_url) fd.append('pdf_url', String(json.pdf_url));
        if (json.image_url) fd.append('image_url', String(json.image_url));

        // Keys backend: xml (alias archivo_xml), pdf (alias archivo_pdf),
        // imagen (alias image/foto/archivo_imagen)
        if (files.xml) fd.append('xml', files.xml, files.xml.name);
        if (files.pdf) fd.append('pdf', files.pdf, files.pdf.name);
        if (files.imagen) fd.append('imagen', files.imagen, files.imagen.name);
        return fd;
    }

    /**
     * Endpoint único: POST /api/compras/crear/
     * - Sin archivos -> JSON (Content-Type: application/json)
     * - Con archivos -> multipart/form-data (mismos campos + files xml/pdf/imagen)
     */
    crearComprobante(compra: CreateCompra): Observable<any> {
        const files = this.getFiles(compra);
        const hasFiles = !!(files.xml || files.pdf || files.imagen);

        const req$ = hasFiles
            ? this.http.post(this.CREAR_URL, this.buildMultipartPayload(compra, files))
            : this.http.post(this.CREAR_URL, this.buildJsonPayload(compra));

        return req$.pipe(
            timeout(60000),
            catchError((error) => {
                console.error('Error al crear comprobante de compra', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * PATCH /api/compras/actualizar/<id>/ — parcial: solo toca lo enviado.
     * - Sin archivos -> JSON. Con archivos (reemplazo) -> multipart.
     * - Quitar archivo: eliminar_xml/pdf/imagen true o url en null.
     * - Restaurar: omitir ese kind. Si envías items, total/igv se recalculan.
     */
    actualizarComprobante(id: number, cambios: UpdateCompra): Observable<any> {
        const { xml, pdf, imagen, ...rest } = cambios as any;
        const hasFiles = xml instanceof File || pdf instanceof File || imagen instanceof File;

        let body: any;
        if (hasFiles) {
            const fd = new FormData();
            for (const [k, v] of Object.entries(rest)) {
                if (v === undefined) continue;
                if (k === 'proveedor' || k === 'items') fd.append(k, JSON.stringify(v));
                else if (v === null) fd.append(k, '');
                else fd.append(k, String(v));
            }
            if (xml instanceof File) fd.append('xml', xml, xml.name);
            if (pdf instanceof File) fd.append('pdf', pdf, pdf.name);
            if (imagen instanceof File) fd.append('imagen', imagen, imagen.name);
            body = fd;
        } else {
            body = rest;
        }

        return this.http.patch(this.ACTUALIZAR_URL(id), body).pipe(
            timeout(60000),
            catchError((error) => {
                console.error('Error al actualizar comprobante de compra', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * @deprecated El backend unificó la creación en POST /api/compras/crear/.
     * Se mantiene por compat: ahora delega a crearComprobante (multipart).
     * Preferir dispatch de crearCompra con serie/correlativo/fecha_emision/items.
     */
    subirFilesComprobante(
        tipoComprobante: string,
        xmlFile: File | null,
        pdfFile: File | null,
        observaciones?: string
    ): Observable<SubirFileResponse> {
        const fd = new FormData();
        fd.append('tipo_comprobante', tipoComprobante);
        if (xmlFile) fd.append('xml', xmlFile, xmlFile.name);
        if (pdfFile) fd.append('pdf', pdfFile, pdfFile.name);
        if (observaciones) fd.append('observaciones', observaciones);

        return this.http.post<SubirFileResponse>(this.CREAR_URL, fd).pipe(
            timeout(60000),
            catchError((error) => {
                console.error('Error al subir archivos de comprobante', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * @deprecated La vista de archivos ahora es un filtro (con_pdf/con_xml)
     * sobre GET /api/compras/lista/. Se mantiene por compat mapeando al
     * nuevo endpoint.
     */
    getComprobantesFiles(page: number = 1, page_size: number = 10): Observable<ComprobanteFilesResponse> {
        return this.getComprobantes(page, page_size, { con_pdf: true } as any).pipe(
            map((res: any) => {
                // El backend nuevo devuelve ComprobanteCompra[] con xml_url/pdf_url.
                // Si ya viene con forma { results: ComprobanteFile[] }, pasarlo tal cual.
                if (res && Array.isArray(res.results) && res.results.length && 'xml_url' in res.results[0] && !('serie' in res.results[0])) {
                    return res as ComprobanteFilesResponse;
                }
                const files: ComprobanteFile[] = (res.results || [])
                    .filter((c: any) => c.xml_url || c.pdf_url || c.archivo_xml || c.archivo_pdf)
                    .map((c: any) => ({
                        id: c.id,
                        tienda: c.tienda ?? 0,
                        tipo_comprobante: c.tipo_comprobante_display || c.tipo_comprobante || '',
                        tipo_comprobante_codigo: c.tipo_comprobante || '',
                        xml_url: c.xml_url ?? c.archivo_xml ?? null,
                        pdf_url: c.pdf_url ?? c.archivo_pdf ?? null,
                        observaciones: c.observaciones || '',
                        date_created: c.date_created || c.fecha_emision || '',
                    }));
                return { results: files };
            }),
            catchError((error) => {
                console.error('Error al obtener comprobantes files', error);
                return throwError(() => error);
            })
        );
    }
}
