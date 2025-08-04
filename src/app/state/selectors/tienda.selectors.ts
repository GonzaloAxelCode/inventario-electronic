import { TiendaState } from '@/app/models/tienda.models';
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';




export const selectTiendaState = (state: AppState) => state.Tienda;

export const selectTienda = createSelector(
    selectTiendaState,
    (state: TiendaState) => state
);


