import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { UserService } from '@/app/services/user.service';
import {
    createUserAction, createUserFail, createUserSuccess,
    deleteUserAction, deleteUserFail, deleteUserSuccess,
    desactivateUserAction, desactivateUserFail, desactivateUserSuccess,
    loadUserAction,
    loadUserFail,
    loadUsersAction, loadUsersFail, loadUsersSuccess,
    loadUserSuccess,
    updateUserAction, updateUserFail, updateUserPermissionsAction, updateUserPermissionsFail, updateUserPermissionsSuccess, updateUserSuccess
} from '../actions/user.actions';
import { AppState } from '../app.state';

@Injectable()
export class UserEffects {

    constructor(
        private actions$: Actions,
        private userService: UserService,
        private store: Store<AppState>,
        private toastr: ToastrService,
        private alertService: CustomAlertService
    ) { }
    loadUserEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadUserAction),
            exhaustMap(() =>
                this.userService.fetchCurrentUser().pipe(
                    map((data: any) => {

                        return loadUserSuccess({ user: data });
                    }),
                    catchError(error => of(loadUserFail({ error })))
                )
            )
        )
    );


    loadUsersEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadUsersAction),
            exhaustMap(({ idTienda }) =>
                this.userService.fetchUsers(idTienda).pipe(
                    map(users => {

                        return loadUsersSuccess({ users })
                    }),
                    catchError(error => of(loadUsersFail({ error })))
                )
            )
        )
    );


    createUserEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createUserAction),
            exhaustMap(({ user, tienda_id }) =>
                this.userService.createUser(user, tienda_id).pipe(
                    map((data: any) => {

                        this.alertService.showSuccess('Usuario creado exitosamente', 'Éxito').subscribe();


                        return createUserSuccess({ user: data.usuario });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al crear el usuario', 'Error').subscribe();
                        return of(createUserFail({ error }));
                    })
                )
            )
        )
    );


    updateUserEffect = createEffect(() =>

        this.actions$.pipe(
            ofType(updateUserAction),
            exhaustMap(({ user }) =>
                this.userService.updateUser(user).pipe(
                    map((res: any) => {
                        this.alertService.showSuccess('Usuario actualizado exitosamente', 'Éxito').subscribe();


                        return updateUserSuccess({ user: res.user });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al actualizar el usuario', 'Error').subscribe();
                        return of(updateUserFail({ error }));
                    })
                )
            )
        )
    );
    updateUserPermisionsEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(updateUserPermissionsAction),
            exhaustMap(({ id, permiso, valor }) =>
                this.userService.updateUserPermissions(id, permiso, valor).pipe(
                    map(() => {
                        this.alertService.showSuccess('Permisos actualizados exitosamente', 'Éxito').subscribe();
                        return updateUserPermissionsSuccess({ id, permiso, valor });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al actualizar los permisos', 'Error').subscribe();
                        return of(updateUserPermissionsFail({ error }));
                    })
                )
            )
        )
    );

    desactivateUserEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(desactivateUserAction),
            exhaustMap(({ id, is_active }) =>
                this.userService.desactivateUser(id, is_active).pipe(
                    map(() => {
                        this.alertService.showSuccess('Usuario actualizado', 'Éxito').subscribe();

                        return desactivateUserSuccess({ id, is_active });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al actualizar el usuario', 'Error').subscribe();
                        return of(desactivateUserFail({ error }));
                    })
                )
            )
        )
    );


    deleteUserEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteUserAction),
            exhaustMap(({ id }) =>
                this.userService.deleteUser(id).pipe(
                    map(() => {
                        this.alertService.showSuccess('Usuario eliminado exitosamente', 'Éxito').subscribe();
                        return deleteUserSuccess({ id });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al eliminar el usuario', 'Error').subscribe();
                        return of(deleteUserFail({ error }));
                    })
                )
            )
        )
    );
}
