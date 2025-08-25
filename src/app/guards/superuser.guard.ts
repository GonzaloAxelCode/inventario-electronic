import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUser } from '../state/selectors/user.selectors';

// 🔑 guard para superusuarios
export function superUserGuard() {
    return (): Observable<boolean | UrlTree> => {
        const store = inject(Store<AppState>);
        const router = inject(Router);
        return store.select(selectUser).pipe(
            filter(state => !state.loadingCurrentUser),
            map((state: any) => {
                const isSuperUser = !!state.user.is_superuser;
                if (isSuperUser) {
                    // Si es superusuario, permitir acceso
                    return true;
                } else {
                    // Si NO es superusuario, redirigir a app
                    return router.createUrlTree(['/app']);
                }
            })
        );
    };
}