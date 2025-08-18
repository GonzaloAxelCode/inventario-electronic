import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUser } from '../state/selectors/user.selectors';


export const superUserGuard2 = (): Observable<boolean> => {
    const store = inject(Store<AppState>);
    const router = inject(Router);

    return store.select(selectUser).pipe(
        // Verificar si el usuario es un superusuario
        map(state => state.user.is_superuser || false),
        tap(isSuperuser => {
            if (!isSuperuser) {
                // Si no es superusuario, redirigir al home ("/")
                router.navigate(['/']);
            }
        })
    );
};
