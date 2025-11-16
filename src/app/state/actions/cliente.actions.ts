import { Cliente, ClienteCreate, ClienteUpdate } from '@/app/models/cliente.models';
import { createAction, props } from '@ngrx/store';


export enum ClienteActionTypes {
    LOAD_CLIENTES = '[Cliente] Load Clientes',
    LOAD_CLIENTES_SUCCESS = '[Cliente] Load Clientes Success',
    LOAD_CLIENTES_FAIL = '[Cliente] Load Clientes Fail',

    CREATE_CLIENTE = '[Cliente] Create Cliente',
    CREATE_CLIENTE_SUCCESS = '[Cliente] Create Cliente Success',
    CREATE_CLIENTE_FAIL = '[Cliente] Create Cliente Fail',

    UPDATE_CLIENTE = '[Cliente] Update Cliente',
    UPDATE_CLIENTE_SUCCESS = '[Cliente] Update Cliente Success',
    UPDATE_CLIENTE_FAIL = '[Cliente] Update Cliente Fail',

    DELETE_CLIENTE = '[Cliente] Delete Cliente',
    DELETE_CLIENTE_SUCCESS = '[Cliente] Delete Cliente Success',
    DELETE_CLIENTE_FAIL = '[Cliente] Delete Cliente Fail',

    GET_CLIENTE = '[Cliente] Get Cliente',
    GET_CLIENTE_SUCCESS = '[Cliente] Get Cliente Success',
    GET_CLIENTE_FAIL = '[Cliente] Get Cliente Fail',

    DEACTIVATE_CLIENTE = '[Cliente] Deactivate Cliente',
    DEACTIVATE_CLIENTE_SUCCESS = '[Cliente] Deactivate Cliente Success',
    DEACTIVATE_CLIENTE_FAIL = '[Cliente] Deactivate Cliente Fail'
}

// 🔹 Cargar todos los clientes
export const loadClientes = createAction(ClienteActionTypes.LOAD_CLIENTES);
export const loadClientesSuccess = createAction(
    ClienteActionTypes.LOAD_CLIENTES_SUCCESS,
    props<{ clientes: Cliente[] }>()
);
export const loadClientesFail = createAction(
    ClienteActionTypes.LOAD_CLIENTES_FAIL,
    props<{ error: any }>()
);

// 🔹 Crear cliente
export const createClienteAction = createAction(
    ClienteActionTypes.CREATE_CLIENTE,
    props<{ cliente: ClienteCreate }>()
);
export const createClienteSuccess = createAction(
    ClienteActionTypes.CREATE_CLIENTE_SUCCESS,
    props<{ cliente: Cliente }>()
);
export const createClienteFail = createAction(
    ClienteActionTypes.CREATE_CLIENTE_FAIL,
    props<{ error: any }>()
);

// 🔹 Actualizar cliente
export const updateClienteAction = createAction(
    ClienteActionTypes.UPDATE_CLIENTE,
    props<{ cliente: ClienteUpdate }>()
);
export const updateClienteSuccess = createAction(
    ClienteActionTypes.UPDATE_CLIENTE_SUCCESS,
    props<{ cliente: Cliente }>()
);
export const updateClienteFail = createAction(
    ClienteActionTypes.UPDATE_CLIENTE_FAIL,
    props<{ error: any }>()
);

// 🔹 Obtener cliente por DNI
export const getClienteAction = createAction(
    ClienteActionTypes.GET_CLIENTE,
    props<{ dni: string }>()
);
export const getClienteSuccess = createAction(
    ClienteActionTypes.GET_CLIENTE_SUCCESS,
    props<{ cliente: Cliente }>()
);
export const getClienteFail = createAction(
    ClienteActionTypes.GET_CLIENTE_FAIL,
    props<{ error: any }>()
);

// 🔹 Desactivar cliente
export const deactivateClienteAction = createAction(
    ClienteActionTypes.DEACTIVATE_CLIENTE,
    props<{ dni: string }>()
);
export const deactivateClienteSuccess = createAction(
    ClienteActionTypes.DEACTIVATE_CLIENTE_SUCCESS,
    props<{ message: string }>()
);
export const deactivateClienteFail = createAction(
    ClienteActionTypes.DEACTIVATE_CLIENTE_FAIL,
    props<{ error: any }>()
);

// 🔹 Eliminar cliente (si implementas soft delete o similar)
export const deleteClienteAction = createAction(
    ClienteActionTypes.DELETE_CLIENTE,
    props<{ id: number }>()
);
export const deleteClienteSuccess = createAction(
    ClienteActionTypes.DELETE_CLIENTE_SUCCESS,
    props<any>()
);
export const deleteClienteFail = createAction(
    ClienteActionTypes.DELETE_CLIENTE_FAIL,
    props<{ error: any }>()
);
