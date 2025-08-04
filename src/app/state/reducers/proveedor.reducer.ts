import { Proveedor } from '@/app/models/proveedor.models';
import { createReducer, on } from '@ngrx/store';
import {
    createProveedorAction,
    createProveedorFail,
    createProveedorSuccess,
    deleteProveedorAction,
    deleteProveedorFail,
    deleteProveedorSuccess,
    loadProveedores,
    loadProveedoresFail,
    loadProveedoresSuccess,
    updateProveedorAction,
    updateProveedorFail,
    updateProveedorSuccess
} from '../actions/proveedor.actions';

export interface ProveedorState {
    proveedores: Proveedor[];
    loadingProveedores?: boolean;
    errors?: any;
}

export const initialState: ProveedorState = {
    proveedores: [],
    loadingProveedores: false,
    errors: {}
};

export const proveedorReducer = createReducer(
    initialState,
    on(loadProveedores, state => ({
        ...state,
        loadingProveedores: true
    })),
    on(loadProveedoresSuccess, (state, { proveedores }) => ({
        ...state,
        proveedores,
        loadingProveedores: false
    })),
    on(loadProveedoresFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingProveedores: false
    })),
    on(createProveedorAction, (state) => ({
        ...state,
        loadingProveedores: true
    })),
    on(createProveedorSuccess, (state, { proveedor }) => ({
        ...state,
        proveedores: [...state.proveedores, proveedor],
        loadingProveedores: false
    })),
    on(createProveedorFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingProveedores: false
    })),
    on(updateProveedorAction, (state) => ({
        ...state,
        loadingProveedores: true
    })),
    on(updateProveedorSuccess, (state, { proveedor }) => ({
        ...state,
        proveedores: state.proveedores.map(p => p.id === proveedor.id ? proveedor : p),
        loadingProveedores: false
    })),
    on(updateProveedorFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingProveedores: false
    })),
    on(deleteProveedorAction, (state) => ({
        ...state,
        loadingProveedores: true
    })),
    on(deleteProveedorSuccess, (state, { id }) => ({
        ...state,
        proveedores: state.proveedores.filter(p => p.id !== id),
        loadingProveedores: false
    })),
    on(deleteProveedorFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingProveedores: false
    }))
);
