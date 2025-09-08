import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { InventarioService } from '@/app/services/inventario.service';
import { InventarioSearchService } from '@/app/services/search-services/inventario-search.service';
import {
    actualizarInventario,


    actualizarInventarioFail,


    actualizarInventarioSuccess,


    cargarProductosMenorStock,


    cargarProductosMenorStockFailure,


    cargarProductosMenorStockSuccess,


    createInventario,

    createInventarioFail,
    createInventarioSuccess,

    eliminarInventarioAction,

    eliminarInventarioFail,

    eliminarInventarioSuccess,

    loadInventarios,

    loadInventariosFail,
    loadInventariosSuccess,
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
        private inventarioSearchService: InventarioSearchService,
        private toastr: ToastrService
    ) { }

    loadInventariosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadInventarios),
            exhaustMap((action) =>
                this.inventarioService.fetchInventariosPorTienda().pipe(
                    map(res => {

                        return loadInventariosSuccess({

                            inventarios: res.results,


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
            map(action => {

                const resultados = this.inventarioSearchService.filtrarInventario(action.inventarios, action.query);


                return searchInventarioSuccess({
                    inventarios_search: resultados.data,
                    search_found: resultados.found
                });
            })
        )
    );


    loadLowStockProductsPorTienda$ = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarProductosMenorStock),
            exhaustMap(() =>
                this.inventarioService.getLowStockProductsPorTienda().pipe(
                    map((res: any) =>

                        cargarProductosMenorStockSuccess({ lowStockProducts: res.lowStockProducts })
                    ),
                    catchError((error) =>
                        of(cargarProductosMenorStockFailure({ error }))
                    )
                )
            )
        )
    );

}
