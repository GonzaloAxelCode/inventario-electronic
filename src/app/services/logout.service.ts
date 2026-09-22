import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { clearTokensAction } from '../state/actions/auth.actions';
import { clearInventariosFromCache } from '../state/actions/inventario.actions';
import { clearUserAction } from '../state/actions/user.actions';
import { AppState } from '../state/app.state';

/**
 * Cierre de sesión 100% local: limpia tokens y datos de usuario de
 * localStorage, el estado en memoria y la caché IndexedDB, y redirige a /login.
 * No requiere red: funciona con el wifi apagado o el backend caído.
 */
@Injectable({
    providedIn: 'root',
})
export class LogoutService {
    private store = inject(Store<AppState>);
    private router = inject(Router);

    logout(): void {
        // Limpieza local primero (síncrona vía reducers + effect de IndexedDB).
        this.store.dispatch(clearTokensAction());
        this.store.dispatch(clearUserAction());
        this.store.dispatch(clearInventariosFromCache());

        // Redirección con fallback duro por si la navegación SPA fallara sin red.
        this.router
            .navigate(['/login'])
            .then((navigated) => {
                if (!navigated) window.location.assign('/login');
            })
            .catch(() => window.location.assign('/login'));
    }
}
