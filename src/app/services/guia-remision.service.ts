import { CreateGuiaPayload, GuiaRemisionRemitente, GuiaSearchPayload, GuiaSearchResponse } from '@/app/models/guia-remision.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';

@Injectable({
    providedIn: 'root',
})
export class GuiaRemisionService {

    private siteURL = URL_BASE + '/api/guias-remision';
    private http = inject(HttpClient);

    /** Últimos filtros usados (para que la paginación los conserve). */
    private ultimosFiltros: GuiaSearchPayload = {};

    guardarUltimosFiltros(filtros: GuiaSearchPayload): void {
        this.ultimosFiltros = { ...filtros };
    }

    obtenerUltimosFiltros(): GuiaSearchPayload {
        return { ...this.ultimosFiltros };
    }

    /** Listado con filtros + rango de fechas. */
    searchGuias(payload: GuiaSearchPayload): Observable<GuiaSearchResponse> {
        const body: GuiaSearchPayload = {
            page: payload.page ?? 1,
            page_size: payload.page_size ?? 10,
            ...(payload.from_date ? { from_date: payload.from_date } : {}),
            ...(payload.to_date ? { to_date: payload.to_date } : {}),
            ...(payload.query && Object.keys(payload.query).length ? { query: payload.query } : {}),
        };
        this.guardarUltimosFiltros(body);
        return this.http.post<GuiaSearchResponse>(`${this.siteURL}/search/`, body).pipe(
            timeout(30000),
            map((res) => ({ ...res, results: (res.results || []).map((g) => this.normalizarGuia(g)) })),
            catchError((error) => {
                console.error('Error al buscar guías de remisión', error);
                return throwError(() => error);
            })
        );
    }

    /** Compat: listado simple / búsqueda rápida por texto. */
    getGuias(page: number = 1, page_size: number = 10, busqueda?: string): Observable<GuiaSearchResponse> {
        const query = busqueda?.trim() ? { search: busqueda.trim() } : undefined;
        return this.searchGuias({ page, page_size, ...(query ? { query } : {}) });
    }

    /** Filtros rápidos por query params. */
    getGuiasFiltroRapido(params: Record<string, string | number>): Observable<any> {
        let httpParams = new HttpParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== '' && v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
        });
        return this.http.get(`${this.siteURL}/`, { params: httpParams }).pipe(
            timeout(30000),
            map((res: any) => {
                const results = Array.isArray(res) ? res : (res?.results || []);
                return { ...res, results: results.map((g: any) => this.normalizarGuia(g)) };
            }),
            catchError((error) => {
                console.error('Error al obtener guías de remisión', error);
                return throwError(() => error);
            })
        );
    }

    getGuiaById(id: number): Observable<GuiaRemisionRemitente> {
        return this.http.get<any>(`${this.siteURL}/${id}/`).pipe(
            timeout(30000),
            map((g) => this.normalizarGuia(g)),
            catchError((error) => {
                console.error('Error al obtener guía de remisión', error);
                return throwError(() => error);
            })
        );
    }

    /** Pre-llenar correlativo antes de crear. Respuesta flexible del backend. */
    proximoCorrelativo(serie: string): Observable<string> {
        const params = new HttpParams().set('serie', serie);
        return this.http.get<any>(`${this.siteURL}/proximo-correlativo/`, { params }).pipe(
            timeout(15000),
            map((res: any) => {
                const raw = res?.correlativo ?? res?.proximo ?? res?.proximo_correlativo ?? res;
                return String(raw ?? '').padStart(7, '0');
            }),
            catchError((error) => {
                console.error('Error al obtener próximo correlativo', error);
                return throwError(() => error);
            })
        );
    }

    /** Crear guía. Con "enviar": true la manda a SUNAT de una vez. */
    crearGuia(guia: CreateGuiaPayload | any): Observable<any> {
        // La tienda/usuario los resuelve el backend desde el token: nunca se envían.
        const { tienda, tienda_id, tiendaId, usuario, usuarioId, usuario_id, ...payload } = guia ?? {};
        return this.http.post<any>(`${this.siteURL}/crear/`, payload).pipe(
            timeout(60000),
            catchError((error) => {
                console.error('Error al crear guía de remisión', error);
                return throwError(() => error);
            })
        );
    }

    /** Enviar un borrador existente a SUNAT. */
    enviarGuia(id: number): Observable<any> {
        return this.http.post<any>(`${this.siteURL}/${id}/enviar/`, {}).pipe(
            timeout(60000),
            catchError((error) => {
                console.error('Error al enviar guía de remisión a SUNAT', error);
                return throwError(() => error);
            })
        );
    }

    /** Sin endpoint de anulación en el backend actual. */
    anularGuia(id: number): Observable<GuiaRemisionRemitente> {
        console.error('Sin endpoint de anulación de guías de remisión para el id', id);
        return throwError(() => new Error('Anulación no disponible en el backend'));
    }

    /**
     * Normaliza la respuesta del backend al modelo que usan las vistas,
     * con tolerancia a campos nuevos/antiguos o anidados.
     */
    normalizarGuia(g: any): GuiaRemisionRemitente {
        const numeroGuia: string = g?.numero_guia ?? '';
        let serie: string = g?.serie ?? '';
        let correlativo: string = g?.correlativo ?? '';
        if ((!serie || !correlativo) && numeroGuia.includes('-')) {
            const [s, c] = numeroGuia.split('-');
            serie = serie || (s ?? '');
            correlativo = correlativo || (c ?? '');
        }
        const conductor = g?.conductores?.[0] ?? {};
        const nombres = [conductor.nombres, conductor.apellidos].filter(Boolean).join(' ').trim();
        const items = (g?.items || []).map((it: any) => ({
            codigo: it.codigo ?? '',
            descripcion: it.descripcion ?? it.producto_nombre ?? '',
            unidad_medida: it.unidad ?? it.unidad_medida ?? 'NIU',
            cantidad: Number(it.cantidad ?? 0),
            peso_kg: it.peso_kg != null ? Number(it.peso_kg) : undefined,
        }));
        const estado: string = g?.estado ?? 'BORRADOR';
        return {
            id: g?.id ?? g?.pk ?? 0,
            serie,
            correlativo,
            fecha_emision: g?.fecha_emision ?? '',
            fecha_traslado: g?.fec_traslado ?? g?.fecha_traslado ?? '',
            ruc_remitente: g?.ruc_remitente ?? '',
            razon_social_remitente: g?.razon_social_remitente ?? '',
            direccion_remitente: g?.direccion_remitente ?? '',
            ubigeo_remitente: g?.ubigeo_remitente ?? g?.emisor_ubigeo ?? '',
            ruc_destinatario: g?.dest_num_doc ?? g?.ruc_destinatario ?? '',
            razon_social_destinatario: g?.dest_nombre ?? g?.razon_social_destinatario ?? '',
            direccion_destinatario: g?.dest_direccion ?? g?.direccion_destinatario ?? '',
            ubigeo_destinatario: g?.ubigeo_destinatario ?? '',
            punto_partida: g?.partida_direccion ?? g?.punto_partida ?? '',
            punto_llegada: g?.llegada_direccion ?? g?.punto_llegada ?? '',
            motivo_traslado: g?.des_traslado ?? g?.motivo_traslado ?? '',
            motivo_traslado_display: g?.motivo_traslado_display ?? g?.des_traslado ?? g?.motivo_traslado ?? '',
            datos_transportista: {
                razon_social: g?.transportista_nombre ?? g?.datos_transportista?.razon_social ?? '',
                ruc: g?.transportista_num_doc ?? g?.datos_transportista?.ruc ?? '',
                nombre_chofer: nombres || g?.datos_transportista?.nombre_chofer || '',
                dni_chofer: conductor.nro_doc ?? g?.datos_transportista?.dni_chofer ?? '',
                placa_vehiculo: g?.vehiculo_placa ?? g?.datos_transportista?.placa_vehiculo ?? '',
                numero_licencia: conductor.licencia ?? g?.datos_transportista?.numero_licencia ?? '',
            },
            items,
            peso_total_kg: Number(g?.peso_total ?? g?.peso_total_kg ?? 0),
            num_bultos: Number(g?.num_bultos ?? 0),
            estado,
            estado_display: g?.estado_display ?? g?.estado_sunat ?? estado,
            observaciones: g?.observacion ?? g?.observaciones ?? '',
            date_created: g?.date_created ?? g?.fecha_emision ?? '',
            date_updated: g?.date_updated ?? '',
            envio: g?.envio ?? null,
        };
    }
}
