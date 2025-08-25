import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUser } from '../state/selectors/user.selectors';

// 🔑 Guard para redirigir automáticamente según el rol
export function roleRedirectGuard() {
    return (): Observable<UrlTree> => {
        const store = inject(Store<AppState>);
        const router = inject(Router);
        return store.select(selectUser).pipe(
            filter(state => !state.loadingCurrentUser),
            map((state: any) => {
                const isSuperUser = !!state.user?.is_superuser
                if (isSuperUser) {
                    return router.createUrlTree(['/admin']);
                } else {

                    return router.createUrlTree(['/app']);
                }
            })
        );
    };
}