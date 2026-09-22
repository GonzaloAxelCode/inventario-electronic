import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';

import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { GuiaRemisionService } from '@/app/services/guia-remision.service';
import {
    cargarGuias,
    cargarGuiasExito,
    cargarGuiasError,
    crearGuia,
    crearGuiaExito,
    crearGuiaError,
    anularGuia,
    anularGuiaExito,
    anularGuiaError,
    enviarGuia,
    enviarGuiaExito,
    enviarGuiaError,
} from '../actions/guia-remision.actions';
import { AppState } from '../app.state';

@Injectable()
export class GuiaRemisionEffects {

    constructor(
        private actions$: Actions,
        private guiaRemisionService: GuiaRemisionService,
        private store: Store<AppState>,
        private alertService: CustomAlertService,
    ) {}

    /** Extrae el detalle del backend (400 de validación o rechazo SUNAT con código). */
    private mensajeErrorGuia(error: any): string {
        const data = error?.error ?? {};
        const primero = (v: any): string => Array.isArray(v) ? String(v[0]) : String(v ?? '');
        if (data.fec_traslado) return primero(data.fec_traslado);
        if (data.detail) return String(data.detail);
        if (data.non_field_errors) return primero(data.non_field_errors);
        if (data.message || data.descripcion) {
            const cod = data.codigo ? ` (código ${data.codigo})` : '';
            return `${data.message || data.descripcion}${cod}`;
        }
        const envio = data.envio ?? {};
        if (envio.descripcion) {
            const cod = envio.codigo ? ` (código ${envio.codigo})` : '';
            return `${envio.message || envio.descripcion}${cod}`;
        }
        return 'Error al registrar la guía de remisión';
    }

    cargarGuiasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarGuias),
            switchMap(({ page, page_size, busqueda, from_date, to_date, query }) => {
                const tieneFiltros = !!(busqueda?.trim() || from_date || to_date || (query && Object.keys(query).length));
                const payload = tieneFiltros
                    ? {
                        page: page ?? 1,
                        page_size: page_size ?? 10,
                        ...(from_date ? { from_date } : {}),
                        ...(to_date ? { to_date } : {}),
                        query: {
                            ...(query ?? {}),
                            ...(busqueda?.trim() ? { search: busqueda.trim() } : {}),
                        },
                    }
                    : {
                        ...this.guiaRemisionService.obtenerUltimosFiltros(),
                        page: page ?? 1,
                        page_size: page_size ?? 10,
                    };
                return this.guiaRemisionService.searchGuias(payload).pipe(
                    map((response) =>
                        cargarGuiasExito({
                            guias: response.results,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages,
                        })
                    ),
                    catchError((error) => of(cargarGuiasError({ error })))
                );
            })
        )
    );

    crearGuiaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(crearGuia),
            exhaustMap(({ guia }) =>
                this.guiaRemisionService.crearGuia(guia).pipe(
                    map((response) => {
                        const envio = response?.envio ?? null;
                        const creada = response?.guia ?? response;
                        this.alertService.showSuccess(
                            envio?.numero_guia ? `Guía ${envio.numero_guia} enviada a SUNAT` : 'Guía de remisión registrada exitosamente',
                            'Éxito'
                        ).subscribe();
                        return crearGuiaExito({
                            guia: this.guiaRemisionService.normalizarGuia({ ...creada, envio }),
                            envio,
                        });
                    }),
                    catchError((error) => {
                        this.alertService.showError(this.mensajeErrorGuia(error), 'Error').subscribe();
                        return of(crearGuiaError({ error }));
                    })
                )
            )
        )
    );

    anularGuiaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(anularGuia),
            exhaustMap(({ id }) =>
                this.guiaRemisionService.anularGuia(id).pipe(
                    map((response) => {
                        this.alertService.showSuccess('Guía de remisión anulada exitosamente', 'Éxito').subscribe();
                        return anularGuiaExito({ guia: response });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al anular la guía de remisión', 'Error').subscribe();
                        return of(anularGuiaError({ error }));
                    })
                )
            )
        )
    );

    enviarGuiaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(enviarGuia),
            exhaustMap(({ id }) =>
                this.guiaRemisionService.enviarGuia(id).pipe(
                    map((response) => {
                        const envio = response?.envio ?? response ?? null;
                        const actualizada = response?.guia ?? null;
                        this.alertService.showSuccess(
                            envio?.numero_guia ? `Guía ${envio.numero_guia} enviada a SUNAT` : 'Guía enviada a SUNAT',
                            'Éxito'
                        ).subscribe();
                        return enviarGuiaExito({
                            guia: actualizada
                                ? this.guiaRemisionService.normalizarGuia({ ...actualizada, envio })
                                : { id } as any,
                            envio,
                        });
                    }),
                    catchError((error) => {
                        this.alertService.showError(this.mensajeErrorGuia(error), 'Error').subscribe();
                        return of(enviarGuiaError({ error }));
                    })
                )
            )
        )
    );
}
