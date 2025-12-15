import { Cliente } from '@/app/models/cliente.models';
import { createReducer, on } from '@ngrx/store';
import {
    clearSearchClientes,
    createClienteAction,
    createClienteFail,
    createClienteSuccess,
    deactivateClienteAction,
    deactivateClienteFail,
    deactivateClienteSuccess,
    deleteClienteAction,
    deleteClienteFail,
    deleteClienteSuccess,
    forceSyncClientes,
    getClienteAction,
    getClienteFail,
    getClienteSuccess,
    loadClientes,
    loadClientesFail,
    loadClientesSuccess,
    searchClientes,
    searchClientesFail,
    searchClientesSuccess,
    updateClienteAction,
    updateClienteFail,
    updateClienteSuccess
} from '../actions/cliente.actions';

export interface ClienteState {
    clientes: Cliente[];
    search_found: boolean;
    count: number;
    next: any;
    previous: any
    index_page: any;
    length_pages: any;
    clienteSeleccionado?: Cliente | null;
    loadingClientes: boolean;
    loadingCreateCliente: boolean;
    loadingUpdateCliente: boolean;
    loadingDesactivateCliente: boolean;
    loadingGetCliente: boolean;
    loadingSearch: boolean;
    errors?: any;
    clientes_search: Cliente[];
}

export const initialState: ClienteState = {
    clientes: [],
    clientes_search: [],
    search_found: false,  // Inicializa como string vacío si es que no hay un valor predeterminado
    count: 0,
    next: null,
    previous: null,
    errors: {},  // Inicializa como un objeto vacío
    index_page: null,
    length_pages: null,
    loadingSearch: false,
    clienteSeleccionado: null,
    loadingClientes: false,
    loadingCreateCliente: false,
    loadingUpdateCliente: false,
    loadingDesactivateCliente: false,
    loadingGetCliente: false,

};

export const clienteReducer = createReducer(
    initialState,
    on(forceSyncClientes, state => ({
        ...state,
        loadingClientes: true
    })),


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
    })),


    //search
    on(searchClientes, state => ({
        ...state,
        loadingSearch: true
    })),
    on(searchClientesSuccess, (state, { clientes_search, search_found }) => ({
        ...state,
        clientes_search: clientes_search,
        search_found: search_found

    })),
    on(searchClientesFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingSearch: false
    })),
    on(clearSearchClientes, (state) => ({
        ...state,
        count: 0,
        loadingSearch: false,
        clientes_search: [],
        search_found: false
    })),
);
