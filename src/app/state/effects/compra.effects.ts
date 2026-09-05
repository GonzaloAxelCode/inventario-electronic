import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';

import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { CompraService } from '@/app/services/compra.service';
import {
    cargarCompras,
    cargarComprasExito,
    cargarComprasError,
    crearCompra,
    crearCompraExito,
    crearCompraError,
    searchCompras,
    searchComprasExito,
    searchComprasError,
    subirFiles,
    subirFilesExito,
    subirFilesError,
    cargarFiles,
    cargarFilesExito,
    cargarFilesError,
} from '../actions/compra.actions';
import { AppState } from '../app.state';

@Injectable()
export class CompraEffects {

    constructor(
        private actions$: Actions,
        private compraService: CompraService,
        private store: Store<AppState>,
        private alertService: CustomAlertService,
    ) {}

    cargarComprasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarCompras),
            switchMap(({ page, page_size }) =>
                this.compraService.getComprobantes(page, page_size).pipe(
                    map((response) =>
                        cargarComprasExito({
                            comprobantes: response.results,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages,
                        })
                    ),
                    catchError((error) => of(cargarComprasError({ error })))
                )
            )
        )
    );

    crearCompraEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(crearCompra),
            exhaustMap(({ compra }) =>
                this.compraService.crearComprobante(compra).pipe(
                    map((response) => {
                        this.alertService.showSuccess('Comprobante registrado exitosamente', 'Exito').subscribe();
                        return crearCompraExito({ comprobante: response.comprobante });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar el comprobante', 'Error').subscribe();
                        return of(crearCompraError({ error }));
                    })
                )
            )
        )
    );

    searchComprasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(searchCompras),
            switchMap(({ query, page, page_size }) =>
                this.compraService.searchComprobantes(query, page, page_size).pipe(
                    map((response) =>
                        searchComprasExito({
                            comprobantes: response.results,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages,
                        })
                    ),
                    catchError((error) => of(searchComprasError({ error })))
                )
            )
        )
    );

    subirFilesEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(subirFiles),
            exhaustMap(({ tipoComprobante, xml, pdf, observaciones }) =>
                this.compraService.subirFilesComprobante(tipoComprobante, xml || null, pdf || null, observaciones).pipe(
                    map((response) => {
                        this.alertService.showSuccess('Comprobante guardado exitosamente', 'Exito').subscribe();
                        return subirFilesExito({ response });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al subir los archivos', 'Error').subscribe();
                        return of(subirFilesError({ error }));
                    })
                )
            )
        )
    );

    cargarFilesEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarFiles),
            switchMap(() =>
                this.compraService.getComprobantesFiles().pipe(
                    map((response) =>
                        cargarFilesExito({
                            files: response.results || [],
                        })
                    ),
                    catchError((error) => of(cargarFilesError({ error })))
                )
            )
        )
    );
}
