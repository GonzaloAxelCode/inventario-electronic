import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ClienteState } from '../reducers/cliente.reducer';

export const selectClienteState = (state: AppState) => state.Cliente;

export const selectCliente = createSelector(
    selectClienteState,
    (state: ClienteState) => state
);

export const selectResumenClientes = createSelector(
    selectClienteState,
    (state: ClienteState) => state.resumenClientes
);

export const selectLoadingResumen = createSelector(
    selectClienteState,
    (state: ClienteState) => state.loadingResumen
);

export const selectClientesFrecuentes = createSelector(
    selectClienteState,
    (state: ClienteState) => state.clientesFrecuentes
);

export const selectLoadingClientesFrecuentes = createSelector(
    selectClienteState,
    (state: ClienteState) => state.loadingClientesFrecuentes
);

export const selectTopClientesCompra = createSelector(
    selectClienteState,
    (state: ClienteState) => state.topClientesCompra
);

export const selectLoadingTopClientes = createSelector(
    selectClienteState,
    (state: ClienteState) => state.loadingTopClientes
);