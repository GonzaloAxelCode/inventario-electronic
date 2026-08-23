import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { InventarioState } from '../reducers/inventario.reducer';

export const selectInventarioState = (state: AppState) => state.Inventario;

export const selectInventario = createSelector(
    selectInventarioState,
    (state: InventarioState) => state
);

export const selectDistribucionStock = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.distribucionStock
);

export const selectLoadingDistribucionStock = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.loadingDistribucionStock
);

export const selectValorizacion = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.valorizacion
);

export const selectLoadingValorizacion = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.loadingValorizacion
);

export const selectTopCategoriasCompra = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.topCategoriasCompra
);

export const selectLoadingTopCategoriasCompra = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.loadingTopCategoriasCompra
);




