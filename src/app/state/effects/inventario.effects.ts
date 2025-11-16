import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { InventarioService } from '@/app/services/inventario.service';
import { InventarioSearchService } from '@/app/services/search-services/inventario-search.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
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
        private toastr: ToastrService,
        private alertService: CustomAlertService
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
                        this.alertService.showSuccess('Inventario creado exitosamente').subscribe();
                        return createInventarioSuccess({ inventario: res });
                    }),
                    catchError(error => {

                        if (error.error.string_err === ERRORS_INVENTARIO.INVENTARIO_EXIXTENTE) {
                            this.alertService.showInfo('Ya existe un inventario con ese producto').subscribe();
                        } else {
                            this.alertService.showError('Error al crear el inventario').subscribe();
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
                        this.alertService.showSuccess('Stock actualizado exitosamente').subscribe();
                        return updateStockSuccess({ inventario: res.inventario });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al actualizar el stock').subscribe();
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
                        this.alertService.showSuccess('Inventario actualizado exitosamente').subscribe();
                        return actualizarInventarioSuccess({ newInventario });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al actualizar el inventario').subscribe();
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
                        this.alertService.showSuccess('Inventario eliminado').subscribe();
                        return eliminarInventarioSuccess({ inventarioId });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al eliminar el inventario', 'Error').subscribe();
                        return of(eliminarInventarioFail({ error }));
                    })
                )
            )
        )
    );


    searchInventariosEffect = createEffect(() =>
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
