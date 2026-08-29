import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectAuth } from '../state/selectors/auth.selectors';
import { selectUser } from '../state/selectors/user.selectors';

export function redirectGuard() {
    return (): Observable<UrlTree> => {
        const store = inject(Store<AppState>);
        const router = inject(Router);

        return combineLatest([
            store.select(selectAuth),
            store.select(selectUser),
        ]).pipe(
            filter(([authState, userState]) => {
                if (authState.loadingCheckAuthenticated) {
                    return false;
                }
                if (!authState.isAuthenticated) {
                    return true;
                }
                return !userState.loadingCurrentUser && !!userState.user;
            }),
            map(([authState, userState]) => {
                if (!authState.isAuthenticated) {
                    return router.createUrlTree(['/login']);
                }
                const user = userState.user as any;
                const isSuperUser = !!user?.is_superuser;
                const isAdminTienda = user?.es_propietario === true;
                if (isSuperUser) return router.createUrlTree(['/admin']);
                if (isAdminTienda) return router.createUrlTree(['/admin/store']);
                return router.createUrlTree(['/app']);
            })
        );
    };
}
