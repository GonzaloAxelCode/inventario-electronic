import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { CompraState } from '../reducers/compra.reducer';

export const selectCompraState = (state: AppState) => state.Compra;

export const selectCompra = createSelector(
    selectCompraState,
    (state: CompraState) => state
);
