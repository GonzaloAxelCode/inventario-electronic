import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { CajaState } from '../reducers/caja.reducer';



export const selectCajaState = (state: AppState) => state.Caja;

export const selectCaja = createSelector(
    selectCajaState,
    (state: CajaState) => state
);

