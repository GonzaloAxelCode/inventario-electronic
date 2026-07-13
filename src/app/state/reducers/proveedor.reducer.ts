import { Proveedor } from '@/app/models/proveedor.models';
import { createReducer, on } from '@ngrx/store';
import {
    createProveedorAction,
    createProveedorFail,
    createProveedorSuccess,
    loadProveedores,
    loadProveedoresFail,
    loadProveedoresSuccess,
    toggleProveedorAction,
    toggleProveedorFail,
    toggleProveedorSuccess,
    updateProveedorAction,
    updateProveedorFail,
    updateProveedorSuccess
} from '../actions/proveedor.actions';

export interface ProveedorState {
    proveedores: Proveedor[];
    loadingProveedores: boolean;
    errors: any;
    loadingCreateProveedor: boolean;
    loadingUpdateProveedor: boolean;
    loadingToggleProveedor: boolean;
}

export const initialState: ProveedorState = {
    proveedores: [],
    loadingProveedores: false,
    loadingCreateProveedor: false,
    loadingUpdateProveedor: false,
    loadingToggleProveedor: false,
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
        loadingCreateProveedor: true
    })),
    on(createProveedorSuccess, (state, { proveedor }) => ({
        ...state,
        proveedores: [...state.proveedores, proveedor],
        loadingCreateProveedor: false
    })),
    on(createProveedorFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingCreateProveedor: false
    })),
    on(updateProveedorAction, (state) => ({
        ...state,
        loadingUpdateProveedor: true
    })),
    on(updateProveedorSuccess, (state, { proveedor }) => ({
        ...state,
        proveedores: state.proveedores.map(p => p.id === proveedor.id ? proveedor : p),
        loadingUpdateProveedor: false
    })),
    on(updateProveedorFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingUpdateProveedor: false
    })),
    on(toggleProveedorAction, (state) => ({
        ...state,
        loadingToggleProveedor: true
    })),
    on(toggleProveedorSuccess, (state, { response }) => ({
        ...state,
        proveedores: state.proveedores.map(p =>
            p.id === response.id ? { ...p, activo: response.activo, ruc: response.ruc } : p
        ),
        loadingToggleProveedor: false
    })),
    on(toggleProveedorFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingToggleProveedor: false
    }))
);
