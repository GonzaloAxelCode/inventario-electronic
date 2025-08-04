import { checkTokenAction } from '@/app/state/actions/auth.actions';
import { loadCategorias } from '@/app/state/actions/categoria.actions';
import { loadInventarios } from '@/app/state/actions/inventario.actions';
import { loadProductosAction } from '@/app/state/actions/producto.actions';
import { loadProveedores } from '@/app/state/actions/proveedor.actions';
import { loadTiendasAction } from '@/app/state/actions/tienda.actions';
import { loadUserAction, loadUsersAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { TIENDA_ID } from '../constants/tienda-vars';

export const loadDataGuard: CanActivateFn = () => {
    const store = inject(Store<AppState>);
    store.dispatch(checkTokenAction());
    store.dispatch(loadCategorias());
    store.dispatch(loadProductosAction({}));
    store.dispatch(loadProveedores());
    store.dispatch(loadTiendasAction());
    store.dispatch(loadInventarios({ tiendaId: TIENDA_ID }));
    store.dispatch(loadUserAction());
    store.dispatch(loadUsersAction());
    return true;
};
