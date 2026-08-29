import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUser } from '../state/selectors/user.selectors';

export function superUserGuard() {
    return (): Observable<boolean | UrlTree> => {
        const store = inject(Store<AppState>);
        const router = inject(Router);
        return store.select(selectUser).pipe(
            filter(state => !state.loadingCurrentUser && !!state.user),
            map((state: any) => {
                const user = state.user as any;
                const isSuperUser = !!user.is_superuser;
                const isAdminTienda = user?.es_propietario === true;
                if (isSuperUser) {
                    return true;
                }
                if (isAdminTienda) {
                    return router.createUrlTree(['/admin/store']);
                }
                return router.createUrlTree(['/app']);
            })
        );
    };
}

export function adminStoreGuard() {
    return (): Observable<boolean | UrlTree> => {
        const store = inject(Store<AppState>);
        const router = inject(Router);
        return store.select(selectUser).pipe(
            filter(state => !state.loadingCurrentUser && !!state.user),
            map((state: any) => {
                const user = state.user;
                const isSuperUser = !!user.is_superuser;
                // Solo admin tienda = es_propietario === true (endpoint /api/usuarios/me/ -> es_propietario)
                const isAdminTienda = user.es_propietario === true;
                if (isSuperUser || isAdminTienda) {
                    return true;
                }
                return router.createUrlTree(['/app']);
            })
        );
    };
}
