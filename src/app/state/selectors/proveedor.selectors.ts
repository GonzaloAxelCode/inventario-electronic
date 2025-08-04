import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProveedorState } from '../reducers/proveedor.reducer';



export const selectProveedorState = (state: AppState) => state.Proveedor;

export const selectProveedores = createSelector(
    selectProveedorState,
    (state: ProveedorState) => state
);


