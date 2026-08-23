import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, from, map, mergeMap, of, switchMap, tap } from 'rxjs';

import { InventarioCacheService } from '@/app/services/inventario-cache.service';
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

    forceSyncInventarios,

    loadInventarios,

    loadInventariosFail,
    loadInventariosFromCache,
    loadInventariosSuccess,
    loadDistribucionStock,
    loadDistribucionStockFail,
    loadDistribucionStockSuccess,
    loadValorizacion,
    loadValorizacionFail,
    loadValorizacionSuccess,
    loadTopCategoriasCompra,
    loadTopCategoriasCompraFail,
    loadTopCategoriasCompraSuccess,
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
        private cache: InventarioCacheService,
        private actions$: Actions,
        private inventarioService: InventarioService,
        private inventarioSearchService: InventarioSearchService,
        private toastr: ToastrService,
        private alertService: CustomAlertService
    ) { }

    loadInventariosFromCache$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadInventariosFromCache),
            switchMap(async () => {
                const cached = await this.cache.getAll();
                return loadInventariosSuccess({ inventarios: cached });
            })
        )
    );
    loadInventariosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadInventarios),
            exhaustMap(() =>
                from(this.cache.getAll()).pipe(
                    exhaustMap((cached) => {
                        // 🟢 SI HAY CACHE → NO FETCH
                        if (cached.length > 0) {
                            return of(loadInventariosSuccess({ inventarios: cached }));
                        }

                        // 🔴 SI NO HAY CACHE → FETCH
                        return this.inventarioService.fetchInventariosPorTienda().pipe(
                            tap(async res => {
                                await this.cache.saveAll(res.results);
                                await this.cache.setLastSync(new Date().toISOString());
                            }),
                            map(res =>
                                loadInventariosSuccess({ inventarios: res.results })
                            ),
                            catchError(error => of(loadInventariosFail({ error })))
                        );
                    })
                )
            )
        )
    );


    forceSyncInventariosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(forceSyncInventarios),
            exhaustMap(() =>
                this.inventarioService.fetchInventariosPorTienda().pipe(
                    tap(async res => {
                        await this.cache.clear();
                        await this.cache.saveAll(res.results);
                        await this.cache.setLastSync(new Date().toISOString());
                    }),
                    map(res =>
                        loadInventariosSuccess({ inventarios: res.results })
                    ),
                    catchError(error => of(loadInventariosFail({ error })))
                )
            )
        )
    );


    createInventarioEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createInventario),
            exhaustMap(({ inventario }) =>
                this.inventarioService.createInventario(inventario).pipe(
                    mergeMap((res: any) => {
                        this.alertService.showSuccess('Inventario creado exitosamente').subscribe();
                        return [
                            createInventarioSuccess({ inventario: res }),
                            forceSyncInventarios()
                        ];
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
                    mergeMap((res) => {
                        this.alertService.showSuccess('Stock actualizado exitosamente').subscribe();
                        return [
                            updateStockSuccess({ inventario: res.inventario }),
                            forceSyncInventarios()
                        ];
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
                    mergeMap(() => {
                        this.alertService.showSuccess('Inventario actualizado exitosamente').subscribe();
                        return [
                            actualizarInventarioSuccess({ newInventario }),
                            forceSyncInventarios()
                        ];
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

    loadDistribucionStockEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadDistribucionStock),
            exhaustMap(() =>
                this.inventarioService.fetchDistribucionStock().pipe(
                    map(response => loadDistribucionStockSuccess({ distribucion: response.distribucion })),
                    catchError(error => of(loadDistribucionStockFail({ error })))
                )
            )
        )
    );

    loadValorizacionEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadValorizacion),
            exhaustMap(() =>
                this.inventarioService.fetchValorizacionInventario().pipe(
                    map(response => loadValorizacionSuccess({ valorizacion: response.valorizacion })),
                    catchError(error => of(loadValorizacionFail({ error })))
                )
            )
        )
    );

    loadTopCategoriasCompraEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadTopCategoriasCompra),
            exhaustMap(() =>
                this.inventarioService.fetchTopCategoriasCompra().pipe(
                    map(response => loadTopCategoriasCompraSuccess({ topCategorias: response.top_categorias_compra })),
                    catchError(error => of(loadTopCategoriasCompraFail({ error })))
                )
            )
        )
    );

}
