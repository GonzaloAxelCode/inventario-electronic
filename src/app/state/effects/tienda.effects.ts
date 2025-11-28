import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { TiendaService } from '@/app/services/tienda.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { createTiendaAction, createTiendaFail, createTiendaSuccess, desactivateTiendaAction, desactivateTiendaFail, desactivateTiendaSuccess, eliminarTiendaPermanently, eliminarTiendaPermanentlyFail, eliminarTiendaPermanentlySuccess, loadTiendasAction, loadTiendasFail, loadTiendasSuccess } from '../actions/tienda.actions';

@Injectable()
export class TiendaEffects {

    constructor(
        private actions$: Actions,
        private tiendaService: TiendaService,
        private alertService: CustomAlertService,
        private toastr: ToastrService
    ) { }


    loadTiendasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadTiendasAction),
            exhaustMap(() =>
                this.tiendaService.fetchLoadTiendas().pipe(
                    map(tiendas => {


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
                        this.alertService.showSuccess('Tienda creada exitosamente', 'Éxito').subscribe();
                        return createTiendaSuccess({ tienda: createdTienda });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al crear la tienda', 'Error').subscribe();
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
                            this.alertService.showSuccess('Tienda habilitada exitosamente', 'Éxito').subscribe();
                        } else {
                            this.alertService.showInfo('Tienda deshabilitada exitosamente', 'Éxito').subscribe();
                        }
                        return desactivateTiendaSuccess({ id });
                    }),
                    catchError(error => {

                        this.alertService.showError('Error al cambiar el estado de la tienda', 'Error').subscribe();

                        return of(desactivateTiendaFail({ error }));
                    })
                )
            )
        )
    );
    delteTiendaPermanentlyEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(eliminarTiendaPermanently),
            exhaustMap(({ id }) =>
                this.tiendaService.eliminarTiendaPermanently(id).pipe(
                    map(() => {
                        this.alertService.showSuccess('Tienda eliminada permanentemente', 'Éxito').subscribe();
                        return eliminarTiendaPermanentlySuccess({ id });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al eliminar la tienda', 'Error').subscribe();
                        return of(eliminarTiendaPermanentlyFail({ error }));
                    })
                )
            )
        )
    );
}