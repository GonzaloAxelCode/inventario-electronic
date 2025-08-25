import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUser } from '../state/selectors/user.selectors';

// 🔑 guard para usuarios normales (NO superusuarios)
export function normalUserGuard() {
    return (): Observable<boolean | UrlTree> => {
        const store = inject(Store<AppState>);
        const router = inject(Router);
        return store.select(selectUser).pipe(
            filter(state => !state.loadingCurrentUser),
            map((state: any) => {
                const isSuperUser = !!state.user?.is_superuser;
                if (isSuperUser) {

                    return router.createUrlTree(['/admin']);
                } else {

                    return true;
                }
            })
        );
    };
}