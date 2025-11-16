import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { ProveedorService } from '@/app/services/proveedor.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import {
    createProveedorAction,
    createProveedorFail,
    createProveedorSuccess,
    loadProveedores,
    loadProveedoresFail,
    loadProveedoresSuccess,
    onActiveToggleProveedorAction,
    onActiveToggleProveedorFail,
    onActiveToggleProveedorSuccess,
    updateProveedorAction,
    updateProveedorFail,
    updateProveedorSuccess
} from '../actions/proveedor.actions';
import { AppState } from '../app.state';

@Injectable()
export class ProveedorEffects {

    constructor(
        private actions$: Actions,
        private proveedorService: ProveedorService,
        private store: Store<AppState>,
        private toastr: ToastrService,
        private alertService: CustomAlertService
    ) { }


    loadProveedoresEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadProveedores),
            exhaustMap(() =>
                this.proveedorService.fetchProveedores().pipe(
                    map(proveedores => loadProveedoresSuccess({ proveedores })),
                    catchError(error => of(loadProveedoresFail({ error })))
                )
            )
        )
    );


    createProveedorEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createProveedorAction),
            exhaustMap(({ proveedor }) =>
                this.proveedorService.createProveedor(proveedor).pipe(
                    map(createdProveedor => {
                        this.alertService.showSuccess('Proveedor creado exitosamente', 'Éxito').subscribe();
                        return createProveedorSuccess({ proveedor: createdProveedor });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al crear el proveedor', 'Error').subscribe();
                        return of(createProveedorFail({ error }));
                    })
                )
            )
        )
    );


    updateProveedorEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(updateProveedorAction),
            exhaustMap(({ proveedor }) =>
                this.proveedorService.updateProveedor(proveedor).pipe(
                    map(updatedProveedor => {
                        this.alertService.showSuccess('Proveedor actualizado exitosamente', 'Éxito').subscribe();
                        return updateProveedorSuccess({ proveedor: updatedProveedor });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al actualizar el proveedor', 'Error').subscribe();
                        return of(updateProveedorFail({ error }));
                    })
                )
            )
        )
    );


    deleteProveedorEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(onActiveToggleProveedorAction),
            exhaustMap(({ proveedor, activo }) =>
                this.proveedorService.activateOrDesactivateProveedor(proveedor, activo).pipe(
                    map(() => {
                        this.alertService.showSuccess('Proveedor activado/desactivado exitosamente', 'Éxito').subscribe();
                        return onActiveToggleProveedorSuccess({ proveedor, activo });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al activar/desactivar el proveedor', 'Error').subscribe();
                        return of(onActiveToggleProveedorFail({ error }));
                    })
                )
            )
        )
    );
}