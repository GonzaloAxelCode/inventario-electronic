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

    cargarGuiasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarGuias),
            switchMap(({ page, page_size, busqueda }) =>
                this.guiaRemisionService.getGuias(page, page_size, busqueda).pipe(
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
                )
            )
        )
    );

    crearGuiaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(crearGuia),
            exhaustMap(({ guia }) =>
                this.guiaRemisionService.crearGuia(guia).pipe(
                    map((response) => {
                        this.alertService.showSuccess('Guía de remisión registrada exitosamente', 'Éxito').subscribe();
                        return crearGuiaExito({ guia: response });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar la guía de remisión', 'Error').subscribe();
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
}
