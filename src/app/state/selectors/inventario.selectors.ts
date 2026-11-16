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

export const selectTopProductosCompra = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.topProductosCompra
);

export const selectLoadingTopProductosCompra = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.loadingTopProductosCompra
);

export const selectValorCategoria = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.valorCategoria
);

export const selectLoadingValorCategoria = createSelector(
    selectInventarioState,
    (state: InventarioState) => state.loadingValorCategoria
);




