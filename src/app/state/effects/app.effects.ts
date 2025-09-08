import { checkTokenAction } from '@/app/state/actions/auth.actions';
import { loadCategorias } from '@/app/state/actions/categoria.actions';
import { loadInventarios } from '@/app/state/actions/inventario.actions';
import { loadProductosAction } from '@/app/state/actions/producto.actions';
import { loadProveedores } from '@/app/state/actions/proveedor.actions';
import { loadTiendasAction } from '@/app/state/actions/tienda.actions';
import { loadUserAction, loadUsersAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions, private store: Store<AppState>) { }

    init$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType('@ngrx/effects/init'),
                tap(() => {
                    this.store.dispatch(checkTokenAction());
                    this.store.dispatch(loadUserAction());
                    this.store.dispatch(loadCategorias());
                    this.store.dispatch(loadProductosAction({ page_size: 10 }));
                    this.store.dispatch(loadProveedores());

                    this.store.dispatch(loadTiendasAction());
                    this.store.dispatch(loadInventarios({ page_size: 10 }));

                    this.store.dispatch(loadUsersAction());
                })
            ),
        { dispatch: false }
    );
}
