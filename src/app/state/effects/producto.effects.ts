import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { ProductoService } from '@/app/services/producto.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import {
    createProductoAction, createProductoFail, createProductoSuccess,
    deleteProductoAction, deleteProductoFail, deleteProductoSuccess,
    loadProductosAction, loadProductosFail, loadProductosSuccess,
    searchProductoFail,
    searchProductosAction,
    searchProductoSuccess,
    updateProductoAction, updateProductoFail, updateProductoSuccess
} from '../actions/producto.actions';



@Injectable()
export class ProductoEffects {

    constructor(
        private actions$: Actions,
        private productoService: ProductoService,
        private alertService: CustomAlertService
    ) { }

    loadProductosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadProductosAction),
            exhaustMap((action) =>
                this.productoService.fetchLoadProductos(action.page || 1, action.page_size).pipe(
                    map((response) =>
                        loadProductosSuccess({
                            productos: response.results,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages,
                            all_products: response.all_results
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
                    map(res => {

                        this.alertService
                            .showSuccess('Producto actualizado exitosamente. Actualiza la tabla de productos.')
                            .subscribe();
                        return updateProductoSuccess({ producto });
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


    searchProductosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(searchProductosAction),
            exhaustMap((action) =>
                this.productoService.searchProducts(action.query, action.page || 1, action.page_size || 5).pipe(
                    map(response => {
                        console.log(response)
                        return searchProductoSuccess({
                            productos: response.results,
                            search_products_found: response.search_products_found,
                            count: response.count, next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages
                        });
                    }),
                    catchError(error => {

                        this.alertService
                            .showError('Error al buscar los productos.')
                            .subscribe();
                        return of(searchProductoFail({ error }));
                    })
                )
            )
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
