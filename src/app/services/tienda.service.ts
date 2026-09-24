import { PlanSuscripcion, PlanSuscripcionCreate, PlanSuscripcionUpdate, SuscripcionTiendaResponse, Tienda } from '@/app/models/tienda.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';

@Injectable({
    providedIn: 'root',
})
export class TiendaService {
    private siteURL = URL_BASE + "/api"
    private http = inject(HttpClient)


    fetchLoadTiendas(): Observable<any> {
        return this.http.get<Tienda[]>(`${this.siteURL}/tiendas/`).pipe(
            catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }

    fetchMiTienda(): Observable<Tienda> {
        return this.http.get<Tienda>(`${this.siteURL}/mi-tienda/`).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    createTienda(tienda: FormData): Observable<Tienda> {
        return this.http.post<Tienda>(`${this.siteURL}/tiendas/create/`, tienda).pipe(
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }
    updateTIenda(newtienda: FormData, id: number): Observable<Tienda> {
        return this.http.post<Tienda>(`${this.siteURL}/tiendas/update/${id}/`, newtienda).pipe(
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }
    desactivateTienda({ id, activo }: { id: number, activo: boolean }): Observable<any> {
        return this.http.patch(`${this.siteURL}/tiendas/desactivate/${id}/`, { activo }).pipe(
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    /** Activa/desactiva tienda (POST|PATCH /api/tiendas/desactivate/toggle/<id>/). Solo superusuario. */
    toggleActivacionTienda(id: number, activate: boolean): Observable<{ message: string; tienda_id: number; activo: boolean }> {
        return this.http.patch<{ message: string; tienda_id: number; activo: boolean }>(`${this.siteURL}/tiendas/desactivate/toggle/${id}/`, { activate }).pipe(
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    /** Eliminación temporal: is_deleted=True + activo=False + desactiva usuarios. Solo superusuario. */
    eliminarTemporalTienda(id: number): Observable<{ message: string; tienda_id: number; is_deleted: boolean; activo: boolean }> {
        return this.http.patch<{ message: string; tienda_id: number; is_deleted: boolean; activo: boolean }>(`${this.siteURL}/tiendas/delete/temporal/${id}/`, {}).pipe(
            tap(() => this.clearSuscripcionCache(id)),
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    /** Restaura tienda eliminada: is_deleted=False + activo=True (usuarios quedan desactivados). Solo superusuario. */
    restaurarTienda(id: number): Observable<{ message: string; tienda_id: number; is_deleted: boolean; activo: boolean }> {
        return this.http.patch<{ message: string; tienda_id: number; is_deleted: boolean; activo: boolean }>(`${this.siteURL}/tiendas/delete/restore/${id}/`, {}).pipe(
            tap(() => this.clearSuscripcionCache(id)),
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    updateTiendaStyles(id: number, body: { tipo_style_boleta_ticket: string; tipo_style_boleta_pdf: string; tipo_style_factura_pdf: string }): Observable<any> {
        return this.http.patch(`${this.siteURL}/tiendas/styles/${id}/`, body).pipe(
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    updateTiendaLogos(id: number, formData: FormData): Observable<Tienda> {
        return this.http.patch<Tienda>(`${this.siteURL}/tiendas/${id}/logos/`, formData).pipe(
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }
    eliminarTiendaPermanently(id: number): Observable<any> {
        return this.http.delete(`${this.siteURL}/tiendas/delete/${id}/`).pipe(
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    getPlanYSuscripcion(tiendaId: number, force = false): Observable<SuscripcionTiendaResponse> {
        const cached = this.suscripcionCache.get(tiendaId);
        if (!force && cached) return of(cached);
        return this.http.get<SuscripcionTiendaResponse>(`${this.siteURL}/tiendas/${tiendaId}/planes/`).pipe(
            tap(data => this.suscripcionCache.set(tiendaId, data)),
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    /** Caché en memoria de planes: se llena con el primer GET y vive hasta recargar la página (F5). */
    private planesCache: PlanSuscripcion[] | null = null;
    private planesCache$ : Observable<PlanSuscripcion[]> | null = null;
    /** Caché por tienda de suscripción (GET /api/tiendas/<id>/planes/). */
    private suscripcionCache = new Map<number, SuscripcionTiendaResponse>();

    /** true si ya hay planes cacheados (evita mostrar skeleton en la 2da visita). */
    hasPlanesCache(): boolean {
        return this.planesCache != null;
    }

    /** Limpia caché de planes y suscripciones (llamar tras mutaciones o en logout). */
    clearPlanesCache(): void {
        this.planesCache = null;
        this.planesCache$ = null;
        this.suscripcionCache.clear();
    }

    clearSuscripcionCache(tiendaId?: number): void {
        if (tiendaId != null) this.suscripcionCache.delete(tiendaId);
        else this.suscripcionCache.clear();
    }

    listPlanes(force = false): Observable<PlanSuscripcion[]> {
        if (!force && this.planesCache) return of(this.planesCache);
        if (!force && this.planesCache$) return this.planesCache$;
        this.planesCache$ = this.http.get<PlanSuscripcion[]>(`${this.siteURL}/planes/`).pipe(
            tap(data => { this.planesCache = Array.isArray(data) ? data : []; }),
            shareReplay(1),
            catchError(error => {
                this.planesCache$ = null;
                console.error(error)
                return throwError(error)
            })
        );
        return this.planesCache$;
    }

    /** Crea un plan/suscripción (POST /api/planes/crear/). Solo superusuario. */
    createPlan(body: PlanSuscripcionCreate): Observable<PlanSuscripcion> {
        return this.http.post<PlanSuscripcion>(`${this.siteURL}/planes/crear/`, body).pipe(
            tap(creado => {
                this.planesCache = [...(this.planesCache ?? []), creado];
                this.planesCache$ = null;
            }),
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    updatePlan(planId: number, body: PlanSuscripcionCreate): Observable<PlanSuscripcion> {
        return this.http.put<PlanSuscripcion>(`${this.siteURL}/planes/${planId}/`, body).pipe(
            tap(actualizado => {
                if (this.planesCache) {
                    this.planesCache = this.planesCache.map(p => p.id === actualizado.id ? actualizado : p);
                }
            }),
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    patchPlan(planId: number, body: PlanSuscripcionUpdate): Observable<PlanSuscripcion> {
        return this.http.patch<PlanSuscripcion>(`${this.siteURL}/planes/${planId}/`, body).pipe(
            tap(actualizado => {
                if (this.planesCache) {
                    this.planesCache = this.planesCache.map(p => p.id === actualizado.id ? actualizado : p);
                }
            }),
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }

    cambiarPlanTienda(tiendaId: number, plan_id: number): Observable<Tienda> {
        return this.http.patch<Tienda>(`${this.siteURL}/tiendas/${tiendaId}/cambiar-plan/`, { plan_id }).pipe(
            tap(() => this.clearSuscripcionCache(tiendaId)),
            catchError(error => {
                console.error(error)
                return throwError(error)
            })
        );
    }



}

