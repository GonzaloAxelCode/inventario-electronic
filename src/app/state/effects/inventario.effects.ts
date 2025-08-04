import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { InventarioService } from '@/app/services/inventario.service';
import {
    actualizarInventario,


    actualizarInventarioFail,


    actualizarInventarioSuccess,


    createInventario,

    createInventarioFail,
    createInventarioSuccess,

    eliminarInventarioAction,

    eliminarInventarioFail,

    eliminarInventarioSuccess,

    loadInventarios,

    loadInventariosFail,
    loadInventariosSuccess,

    searchInventarioFail,

    searchInventarios,

    searchInventarioSuccess,

    updateStock,

    updateStockFail,
    updateStockSuccess
} from '../actions/inventario.actions';

const ERRORS_INVENTARIO = {
    INVENTARIO_EXIXTENTE: "inventario_existente"
}


@Injectable()
export class InventarioEffects {

    constructor(
        private actions$: Actions,
        private inventarioService: InventarioService,
        private toastr: ToastrService
    ) { }

    loadInventariosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadInventarios),
            exhaustMap((action) =>
                this.inventarioService.fetchInventariosPorTienda(action.tiendaId, action.page || 1, action.page_size || 5).pipe(
                    map(response => {

                        return loadInventariosSuccess({
                            inventarios: response.results,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages

                        })
                    }),
                    catchError(error => {
                        console.error(error);

                        return of(loadInventariosFail({ error }));
                    })
                )
            )
        )
    );

    createInventarioEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createInventario),
            exhaustMap(({ inventario }) =>
                this.inventarioService.createInventario(inventario).pipe(
                    map((res: any) => {
                        this.toastr.success('Inventario creado exitosamente', 'Éxito');
                        return createInventarioSuccess({ inventario: res });
                    }),
                    catchError(error => {

                        if (error.error.string_err === ERRORS_INVENTARIO.INVENTARIO_EXIXTENTE) {
                            this.toastr.info('Ya existe un inventario con ese producto', 'Información');
                        } else {
                            this.toastr.error('Error al crear el inventario', 'Error');
                        }

                        return of(createInventarioFail({ error }));
                    })
                )
            )
        )
    );

    updateStockEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(updateStock),
            exhaustMap(({ inventarioId, cantidad }) =>
                this.inventarioService.updateStock(inventarioId, cantidad).pipe(
                    map((res) => {
                        this.toastr.success('Stock actualizado exitosamente', 'Éxito');
                        return updateStockSuccess({ inventario: res.inventario });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al actualizar el stock', 'Error');
                        return of(updateStockFail({ error }));
                    })
                )
            )
        )
    );

    actualizarInventarioEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(actualizarInventario),
            exhaustMap(({ newInventario }) =>
                this.inventarioService.actualizarInventario(newInventario).pipe(
                    map(() => {
                        this.toastr.success('Inventario actualizado exitosamente', 'Éxito');
                        return actualizarInventarioSuccess({ newInventario });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al actualizar el inventario', 'Error');
                        return of(actualizarInventarioFail({ error }));
                    })
                )
            )
        )
    );

    eliminarInventarioEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(eliminarInventarioAction),
            exhaustMap(({ inventarioId }) =>
                this.inventarioService.eliminarInventario(inventarioId).pipe(
                    map(() => {
                        this.toastr.success('Inventario eliminado', 'Éxito');
                        return eliminarInventarioSuccess({ inventarioId });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al eliminar el inventario', 'Error');
                        return of(eliminarInventarioFail({ error }));
                    })
                )
            )
        )
    );


    searchProductosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(searchInventarios),
            exhaustMap((action) =>
                this.inventarioService.fetchSearchInventarios(action.query, action.page || 1, action.page_size || 5, action.tiendaId).pipe(
                    map(response => {
                        console.log(response)
                        return searchInventarioSuccess({
                            inventarios: response.results,
                            search_products_found: response.search_products_found,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages
                        });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al buscar los inventarios', 'Error');
                        return of(searchInventarioFail({ error }));
                    })
                )
            )
        )
    );
}
