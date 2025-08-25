import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { TiendaService } from '@/app/services/tienda.service';
import { createTiendaAction, createTiendaFail, createTiendaSuccess, desactivateTiendaAction, desactivateTiendaFail, desactivateTiendaSuccess, loadTiendasAction, loadTiendasFail, loadTiendasSuccess } from '../actions/tienda.actions';

@Injectable()
export class TiendaEffects {

    constructor(
        private actions$: Actions,
        private tiendaService: TiendaService,

        private toastr: ToastrService
    ) { }


    loadTiendasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadTiendasAction),
            exhaustMap(() =>
                this.tiendaService.fetchLoadTiendas().pipe(
                    map(tiendas => {

                        console.log('tiendas', tiendas);
                        return loadTiendasSuccess({ tiendas });

                    }),
                    catchError(error => {

                        return of(loadTiendasFail({ error }));
                    })
                )
            )
        )
    );
    createTiendaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createTiendaAction),
            exhaustMap(({ tienda }) =>
                this.tiendaService.createTienda(tienda).pipe(
                    map(createdTienda => {
                        this.toastr.success('Tienda creada exitosamente', 'Éxito');
                        return createTiendaSuccess({ tienda: createdTienda });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al crear la tienda', 'Error');
                        return of(createTiendaFail({ error }));
                    })
                )
            )
        )
    );

    descativateCategoriaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(desactivateTiendaAction),
            exhaustMap(({ id, activo }) =>
                this.tiendaService.desactivateTienda({ id, activo }).pipe(
                    map(() => {

                        if (activo) {
                            this.toastr.success('Tienda habilitada exitosamente', 'Éxito');
                        } else {
                            this.toastr.info('Tienda deshabilitada exitosamente', 'Éxito');
                        }
                        return desactivateTiendaSuccess({ id });
                    }),
                    catchError(error => {

                        this.toastr.error('Error al cambiar el estado de la tienda', 'Error');

                        return of(desactivateTiendaFail({ error }));
                    })
                )
            )
        )
    );




}
