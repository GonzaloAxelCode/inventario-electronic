import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { ProductoService } from '@/app/services/producto.service';
import { ProductoSearchService } from '@/app/services/search-services/producto-search.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import {
    createProductoAction, createProductoFail, createProductoSuccess,
    deleteProductoAction, deleteProductoFail, deleteProductoSuccess,
    loadProductosAction, loadProductosFail, loadProductosSuccess,
    searchProductosAction,
    searchProductoSuccess,
    updateProductoAction, updateProductoFail, updateProductoSuccess
} from '../actions/producto.actions';



@Injectable()
export class ProductoEffects {

    constructor(
        private actions$: Actions,
        private productoService: ProductoService,
        private alertService: CustomAlertService,

        private productSearchService: ProductoSearchService,
    ) { }

    loadProductosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadProductosAction),
            exhaustMap((action) =>
                this.productoService.fetchLoadProductos().pipe(
                    map((response) =>
                        loadProductosSuccess({
                            productos: response.results,

                        })
                    ),
                    catchError((error) => {
                        console.error(error);
                        return of(loadProductosFail({ error }));
                    })
                )
            )
        )
    );



    createProductoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createProductoAction),
            exhaustMap(({ producto, }) =>
                this.productoService.createProducto(producto,).pipe(
                    map((res: any) => {

                        this.alertService
                            .showSuccess('Producto creado exitosamente. Actualiza la tabla de productos.')
                            .subscribe();
                        return createProductoSuccess({ producto: res.producto });
                    }),
                    catchError(error => {

                        this.alertService
                            .showError('Error al crear el producto.')
                            .subscribe();
                        return of(createProductoFail({ error }));
                    })
                )
            )
        )
    );

    updateProductoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(updateProductoAction),
            exhaustMap(({ producto }) =>
                this.productoService.updateProducto(producto).pipe(
                    map((res: any) => {

                        this.alertService
                            .showSuccess('Producto actualizado exitosamente. Actualiza la tabla de productos.')
                            .subscribe();
                        return updateProductoSuccess({ producto: res.producto });
                    }),
                    catchError(error => {
                        this.alertService
                            .showError('Error al actualizar el producto')
                            .subscribe();

                        return of(updateProductoFail({ error }));
                    })
                )
            )
        )
    );


    searchProductsEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(searchProductosAction),
            map(action => {

                const resultados = this.productSearchService.filtrarProducto(action.products, action.query);


                return searchProductoSuccess({
                    productos_search: resultados.data,
                    search_found: resultados.found
                });
            })
        )
    );



    deleteProductoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteProductoAction),
            exhaustMap(({ id }) =>
                this.productoService.deleteProducto(id).pipe(
                    map(() => {

                        this.alertService
                            .showSuccess('Producto desactivado.')
                            .subscribe();
                        return deleteProductoSuccess({ id });
                    }),
                    catchError(error => {

                        this.alertService
                            .showError('Error al desactivar el producto.')
                            .subscribe();
                        return of(deleteProductoFail({ error }));
                    })
                )
            )
        )
    );

}
