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
    editarCompra,
    editarCompraExito,
    editarCompraError,
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
            switchMap(({ page, page_size, from_date, to_date, query, infinity_scroll }) =>
                this.compraService.listarComprasPost({
                    page: page ?? 1,
                    page_size: page_size ?? 10,
                    infinity_scroll: infinity_scroll ?? false,
                    from_date,
                    to_date,
                    query,
                }).pipe(
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
                        const comprobante = response?.comprobante ?? response?.data ?? response;
                        return crearCompraExito({ comprobante });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar el comprobante', 'Error').subscribe();
                        return of(crearCompraError({ error }));
                    })
                )
            )
        )
    );

    editarCompraEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(editarCompra),
            exhaustMap(({ id, cambios }) =>
                this.compraService.actualizarComprobante(id, cambios).pipe(
                    map((response) => {
                        this.alertService.showSuccess('Compra actualizada exitosamente', 'Exito').subscribe();
                        const comprobante = response?.comprobante ?? response?.data ?? response;
                        return editarCompraExito({ comprobante });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al actualizar la compra', 'Error').subscribe();
                        return of(editarCompraError({ error }));
                    })
                )
            )
        )
    );

    searchComprasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(searchCompras),
            switchMap(({ query, page, page_size, from_date, to_date, infinity_scroll }) =>
                this.compraService.listarComprasPost({
                    page: page ?? 1,
                    page_size: page_size ?? 10,
                    infinity_scroll: infinity_scroll ?? false,
                    from_date: from_date ?? (query as any)?.fecha_desde ?? (query as any)?.from_date,
                    to_date: to_date ?? (query as any)?.fecha_hasta ?? (query as any)?.to_date,
                    query,
                }).pipe(
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
