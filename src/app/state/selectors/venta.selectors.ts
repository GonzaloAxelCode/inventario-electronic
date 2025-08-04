
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { VentaState } from '../reducers/venta.reducer';




export const selectVentaState = (state: AppState) => state.Venta;

export const selectVenta = createSelector(
    selectVentaState,
    (state: VentaState) => state
);




