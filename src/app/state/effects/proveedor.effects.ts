import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { ProveedorService } from '@/app/services/proveedor.service';
import {
    createProveedorAction,
    createProveedorFail,
    createProveedorSuccess,
    deleteProveedorAction,
    deleteProveedorFail,
    deleteProveedorSuccess,
    loadProveedores,
    loadProveedoresFail,
    loadProveedoresSuccess,
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
        private toastr: ToastrService
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
                        this.toastr.success('Proveedor creado exitosamente', 'Éxito');
                        return createProveedorSuccess({ proveedor: createdProveedor });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al crear el proveedor', 'Error');
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
                        this.toastr.success('Proveedor actualizado exitosamente', 'Éxito');
                        return updateProveedorSuccess({ proveedor: updatedProveedor });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al actualizar el proveedor', 'Error');
                        return of(updateProveedorFail({ error }));
                    })
                )
            )
        )
    );


    deleteProveedorEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteProveedorAction),
            exhaustMap(({ id }) =>
                this.proveedorService.deleteProveedor(id).pipe(
                    map(() => {
                        this.toastr.success('Proveedor eliminado exitosamente', 'Éxito');
                        return deleteProveedorSuccess({ id });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al eliminar el proveedor', 'Error');
                        return of(deleteProveedorFail({ error }));
                    })
                )
            )
        )
    );
}