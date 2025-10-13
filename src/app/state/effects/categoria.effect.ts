import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { CategoriaService } from '@/app/services/categoria.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import {
    createCategoriaAction, createCategoriaFail, createCategoriaSuccess,
    deleteCategoriaAction, deleteCategoriaFail, deleteCategoriaSuccess,
    loadCategorias, loadCategoriasFail, loadCategoriasSuccess,
    updateCategoriaAction, updateCategoriaFail, updateCategoriaSuccess
} from '../actions/categoria.actions';
import { AppState } from '../app.state';

@Injectable()
export class CategoriaEffects {


    constructor(
        private actions$: Actions,
        private categoriaService: CategoriaService,
        private store: Store<AppState>,
        private alertService: CustomAlertService
    ) { }

    loadCategoriasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadCategorias),
            exhaustMap(() =>
                this.categoriaService.fetchCategorias().pipe(
                    map(categorias => {

                        return loadCategoriasSuccess({ categorias });
                    }),
                    catchError(error => {
                        console.log("error categorias", error)
                        return of(loadCategoriasFail({ error }));
                    })
                )
            )
        )
    );


    createCategoriaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createCategoriaAction),
            exhaustMap(({ categoria }) =>
                this.categoriaService.createCategoria(categoria).pipe(
                    map(createdCategoria => {
                        this.alertService
                            .showSuccess('Categoría creada con éxito. Revisa la tabla de categorías.')
                            .subscribe();
                        return createCategoriaSuccess({ categoria: createdCategoria });
                    }),
                    catchError(error => {
                        this.alertService

                            .showError(`Error al crear la categoría.<br> ${error.error?.slug?.[0] || ''}`)

                            .subscribe();
                        return of(createCategoriaFail({ error }));
                    })
                )
            )
        )
    );


    updateCategoriaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(updateCategoriaAction),
            exhaustMap(({ categoria }) =>
                this.categoriaService.updateCategoria(categoria).pipe(
                    map(updatedCategoria => {
                        this.alertService
                            .showSuccess('Categoría actualizada con éxito. Revisa la tabla de categorías.')
                            .subscribe();
                        return updateCategoriaSuccess({ categoria: updatedCategoria });
                    }),
                    catchError(error => {
                        this.alertService
                            .showError('Categoría actualizada con error. Revisa la tabla de categorías.')
                            .subscribe();
                        return of(updateCategoriaFail({ error }));
                    })
                )
            )
        )
    );


    deleteCategoriaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteCategoriaAction),
            exhaustMap(({ id }) =>
                this.categoriaService.deleteCategoria(id).pipe(
                    map(() => {
                        this.alertService
                            .showSuccess('Categoría eliminada con éxito. Revisa la tabla de categorías.')
                            .subscribe();
                        return deleteCategoriaSuccess({ id });
                    }),
                    catchError(error => {
                        this.alertService
                            .showError('Error al eliminar. Revisa la tabla de categorías.')
                            .subscribe();
                        return of(deleteCategoriaFail({ error }));
                    })
                )
            )
        )
    );
}
