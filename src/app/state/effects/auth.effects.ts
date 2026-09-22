import { AuthService } from '@/app/services/auth.service';
import { ClienteCacheService } from '@/app/services/cliente-cache.service';
import { InventarioCacheService } from '@/app/services/inventario-cache.service';

import { AuthErrors } from '@/app/models/auth.models';

import { saveAuthDataToLocalStorage, saveLoginUserDataToLocalStorage } from '@/app/services/utils/localstorage-functions';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, filter, map, of, tap, withLatestFrom } from 'rxjs';
import { loadTiendasAction } from '../actions/tienda.actions';
import { loadUserAction, loadUserSuccess } from '../actions/user.actions';
import { AppState } from '../app.state';
import { selectCurrenttUser } from '../selectors/user.selectors';
import {
    checkTokenAction,
    checkTokenActionFail,
    checkTokenActionSuccess,
    clearTokensAction,
    loginInAction,
    loginInActionFail,
    loginInActionSuccess,
    userMeAuthenticated,
    userMeAuthenticatedFail,
    userMeAuthenticatedSuccess
} from '../actions/auth.actions';

@Injectable()
export class AuthEffects {

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private store: Store<AppState>,
        private inventarioCache: InventarioCacheService,
        private clienteCache: ClienteCacheService
    ) { }


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

                        saveLoginUserDataToLocalStorage({
                            rol: response?.rol,
                            tienda: response?.tienda,
                            mis_tiendas_count: response?.mis_tiendas_count,
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
                                // Se normaliza a banderas seguras: la UI nunca renderiza
                                // el cuerpo crudo del backend (stacktraces, "Unauthorized", HTML).
                                errors: normalizeLoginError(error),
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
                })
            ),
        { dispatch: false }
    );

    loadTiendasIfSuperUser$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadUserSuccess),
                withLatestFrom(this.store.select(selectCurrenttUser)),
                filter(([_, user]) => !!user?.is_superuser),
                tap(() => {
                    this.store.dispatch(loadTiendasAction());
                })
            ),
        { dispatch: false }
    );

    clearIdxDBCacheOnLogout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(clearTokensAction),
                tap(async () => {
                    try {
                        await Promise.all([
                            this.inventarioCache.deleteDatabase(),
                            this.clienteCache.deleteDatabase()
                        ]);
                    } catch (error) {
                        console.error('Error al eliminar las bases de datos IndexedDB al cerrar sesión', error);
                    }
                })
            ),
        { dispatch: false }
    );
}

/**
 * Detecta fallos sin respuesta HTTP: backend caído, sin wifi/red
 * (HttpErrorResponse con status 0) o timeout de la petición.
 */
export function isNetworkError(error: any): boolean {
    return !!error && (error?.status === 0 || error?.name === 'TimeoutError');
}

/**
 * Normaliza el fallo de login a banderas seguras para la UI:
 * - red (status 0 / timeout) → networkError
 * - 5xx del backend → serverError (genérico, sin stacktrace)
 * - resto (400/401/403/...) → detail como simple bandera: la UI muestra
 *   el mensaje fijo de credenciales, nunca el texto crudo del backend.
 */
export function normalizeLoginError(error: any): AuthErrors {
    if (isNetworkError(error)) return { networkError: true };
    if ((error?.status ?? 0) >= 500) return { serverError: true };
    const body = error?.error;
    const detail =
        typeof body === 'object' && body !== null
            ? (body.detail ?? body.non_field_errors?.[0] ?? 'Credenciales inválidas')
            : 'Credenciales inválidas';
    return { detail };
}
