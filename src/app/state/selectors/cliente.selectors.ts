import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ClienteState } from '../reducers/cliente.reducer';

// 🔹 Selecciona el estado raíz del feature "Cliente"
export const selectClienteState = (state: AppState) => state.Cliente;

// 🔹 Selecciona todo el estado de cliente
export const selectCliente = createSelector(
    selectClienteState,
    (state: ClienteState) => state
);