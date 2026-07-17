import { AuthService } from '@/app/services/auth.service';

import { saveAuthDataToLocalStorage } from '@/app/services/utils/localstorage-functions';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { loadTiendasAction } from '../actions/tienda.actions';
import { loadUserAction } from '../actions/user.actions';
import { AppState } from '../app.state';
import {
    checkTokenAction,
    checkTokenActionFail,
    checkTokenActionSuccess,
    loginInAction,
    loginInActionFail,
    loginInActionSuccess,
    userMeAuthenticated,
    userMeAuthenticatedFail,
    userMeAuthenticatedSuccess
} from '../actions/auth.actions';

@Injectable()
export class AuthEffects {

    constructor(private actions$: Actions, private authService: AuthService, private store: Store<AppState>) { }


    loginEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loginInAction),
            exhaustMap(({ username, password }) =>
                this.authService.fetchCreateToken({ username, password }).pipe(
                    map((response: any) => {

                        saveAuthDataToLocalStorage({
                            accessToken: response?.access,
                            refreshToken: response?.refresh,

                        });


                        return loginInActionSuccess({
                            refreshToken: response?.refresh,
                            accessToken: response?.access,
                            isAuthenticated: true,
                            isLoadingLogin: false,
                            isLoadingLogout: false,

                        });
                    }),
                    catchError((error) =>
                        of(
                            loginInActionFail({
                                refreshToken: '',
                                accessToken: '',
                                isAuthenticated: false,
                                errors: error?.error,
                                isLoadingLogin: false,
                                isLoadingLogout: false,

                            })
                        )
                    )
                )
            )
        )
    );


    checkTokenEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(checkTokenAction),
            exhaustMap(() =>
                this.authService.fetchCheckAuthenticated().pipe(
                    map((response: any) =>
                        response ? checkTokenActionSuccess() : checkTokenActionFail()
                    ),
                    catchError(() => of(checkTokenActionFail()))
                )
            )
        )
    );
    userMeEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(userMeAuthenticated),
            exhaustMap(() =>
                this.authService.fetchUserMeAuthenticated().pipe(
                    map((response: any) => {
                        return userMeAuthenticatedSuccess({ user_id_auth: response.id })
                    }

                    ),
                    catchError((error) => of(userMeAuthenticatedFail(error)))
                )
            )
        )
    );

    afterAuthSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(checkTokenActionSuccess),
                tap(() => {
                    this.store.dispatch(loadUserAction());
                    this.store.dispatch(loadTiendasAction());
                })
            ),
        { dispatch: false }
    );
}
