import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { InventarioState } from '../reducers/inventario.reducer';

export const selectInventarioState = (state: AppState) => state.Inventario;

export const selectInventario = createSelector(
    selectInventarioState,
    (state: InventarioState) => state
);




