import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUser } from '../state/selectors/user.selectors';

export function normalUserGuard() {
    return (): Observable<boolean | UrlTree> => {
        const store = inject(Store<AppState>);
        const router = inject(Router);
        return store.select(selectUser).pipe(
            filter(state => !state.loadingCurrentUser && !!state.user),
            map((state: any) => {
                const user = state.user;
                const isSuperUser = !!user?.is_superuser;
                const isAdminTienda = (user as any)?.es_propietario === true;
                if (isSuperUser) {
                    return router.createUrlTree(['/admin']);
                }
                if (isAdminTienda) {
                    return router.createUrlTree(['/admin/store']);
                }
                return true;
            })
        );
    };
}
