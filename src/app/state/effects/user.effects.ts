import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

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
        private toastr: ToastrService
    ) { }
    loadUserEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadUserAction),
            exhaustMap(() =>
                this.userService.fetchCurrentUser().pipe(
                    map((data: any) => {
                        console.log("Current User Data:", data);
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
                        console.log(users)
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
                        this.toastr.success('Usuario creado exitosamente', 'Éxito');
                        return createUserSuccess({ user: data.user });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al crear el usuario', 'Error');
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
                        this.toastr.success('Usuario actualizado exitosamente', 'Éxito');
                        return updateUserSuccess({ user: res.user });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al actualizar el usuario', 'Error');
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
                        this.toastr.success('Permisos actualizados exitosamente', 'Éxito');
                        return updateUserPermissionsSuccess({ id, permiso, valor });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al actualizar los permisos', 'Error');
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
                        this.toastr.success('Usuario actualizado', 'Éxito');

                        return desactivateUserSuccess({ id, is_active });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al actualizar el usuario', 'Error');
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
                        this.toastr.success('Usuario eliminado exitosamente', 'Éxito');
                        return deleteUserSuccess({ id });
                    }),
                    catchError(error => {
                        this.toastr.error('Error al eliminar el usuario', 'Error');
                        return of(deleteUserFail({ error }));
                    })
                )
            )
        )
    );
}
