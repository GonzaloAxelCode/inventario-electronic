import { Cliente } from '@/app/models/cliente.models';
import { createReducer, on } from '@ngrx/store';
import {
    createClienteAction,
    createClienteFail,
    createClienteSuccess,
    deactivateClienteAction,
    deactivateClienteFail,
    deactivateClienteSuccess,
    deleteClienteAction,
    deleteClienteFail,
    deleteClienteSuccess,
    getClienteAction,
    getClienteFail,
    getClienteSuccess,
    loadClientes,
    loadClientesFail,
    loadClientesSuccess,
    updateClienteAction,
    updateClienteFail,
    updateClienteSuccess
} from '../actions/cliente.actions';

export interface ClienteState {
    clientes: Cliente[];
    clienteSeleccionado?: Cliente | null;
    loadingClientes: boolean;
    loadingCreateCliente: boolean;
    loadingUpdateCliente: boolean;
    loadingDesactivateCliente: boolean;
    loadingGetCliente: boolean;
    errors?: any;
}

export const initialState: ClienteState = {
    clientes: [],
    clienteSeleccionado: null,
    loadingClientes: false,
    loadingCreateCliente: false,
    loadingUpdateCliente: false,
    loadingDesactivateCliente: false,
    loadingGetCliente: false,
    errors: {}
};

export const clienteReducer = createReducer(
    initialState,

    // 🔹 Cargar todos los clientes
    on(loadClientes, state => ({
        ...state,
        loadingClientes: true
    })),
    on(loadClientesSuccess, (state, { clientes }) => ({
        ...state,
        clientes,
        loadingClientes: false
    })),
    on(loadClientesFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingClientes: false
    })),

    // 🔹 Crear cliente
    on(createClienteAction, state => ({
        ...state,
        loadingCreateCliente: true
    })),
    on(createClienteSuccess, (state, { cliente }) => ({
        ...state,
        clientes: [...state.clientes, cliente],
        loadingCreateCliente: false
    })),
    on(createClienteFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingCreateCliente: false
    })),

    // 🔹 Actualizar cliente
    on(updateClienteAction, state => ({
        ...state,
        loadingUpdateCliente: true
    })),
    on(updateClienteSuccess, (state, { cliente }) => ({
        ...state,
        clientes: state.clientes.map(c => (c.id === cliente.id ? cliente : c)),
        loadingUpdateCliente: false
    })),
    on(updateClienteFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingUpdateCliente: false
    })),

    // 🔹 Obtener cliente por DNI
    on(getClienteAction, state => ({
        ...state,
        loadingGetCliente: true,
        clienteSeleccionado: null
    })),
    on(getClienteSuccess, (state, { cliente }) => ({
        ...state,
        clienteSeleccionado: cliente,
        loadingGetCliente: false
    })),
    on(getClienteFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingGetCliente: false
    })),

    // 🔹 Desactivar cliente
    on(deactivateClienteAction, state => ({
        ...state,
        loadingDesactivateCliente: true
    })),
    on(deactivateClienteSuccess, (state, { message }) => ({
        ...state,
        // Puedes marcar al cliente como inactivo en el array si lo prefieres:
        // clientes: state.clientes.map(c => c.dni === dni ? { ...c, activo: false } : c),
        loadingDesactivateCliente: false
    })),
    on(deactivateClienteFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingDesactivateCliente: false
    })),

    // 🔹 Eliminar cliente
    on(deleteClienteAction, state => ({
        ...state,
        loadingDesactivateCliente: true
    })),
    on(deleteClienteSuccess, (state, { id }) => ({
        ...state,
        clientes: state.clientes.filter(c => c.id !== id),
        loadingDesactivateCliente: false
    })),
    on(deleteClienteFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingDesactivateCliente: false
    }))
);
