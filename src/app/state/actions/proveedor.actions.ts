import { Proveedor, ProveedorCreate, ToggleProveedorResponse } from '@/app/models/proveedor.models';
import { createAction, props } from '@ngrx/store';

export enum ProveedorActionTypes {
    LOAD_PROVEEDORES = '[Proveedor] Load Proveedores',
    LOAD_PROVEEDORES_SUCCESS = '[Proveedor] Load Proveedores Success',
    LOAD_PROVEEDORES_FAIL = '[Proveedor] Load Proveedores Fail',
    CREATE_PROVEEDOR = '[Proveedor] Create Proveedor',
    CREATE_PROVEEDOR_SUCCESS = '[Proveedor] Create Proveedor Success',
    CREATE_PROVEEDOR_FAIL = '[Proveedor] Create Proveedor Fail',
    UPDATE_PROVEEDOR = '[Proveedor] Update Proveedor',
    UPDATE_PROVEEDOR_SUCCESS = '[Proveedor] Update Proveedor Success',
    UPDATE_PROVEEDOR_FAIL = '[Proveedor] Update Proveedor Fail',
    TOGGLE_PROVEEDOR = '[Proveedor] Toggle Proveedor',
    TOGGLE_PROVEEDOR_SUCCESS = '[Proveedor] Toggle Proveedor Success',
    TOGGLE_PROVEEDOR_FAIL = '[Proveedor] Toggle Proveedor Fail',
}

export const loadProveedores = createAction(ProveedorActionTypes.LOAD_PROVEEDORES);
export const loadProveedoresSuccess = createAction(
    ProveedorActionTypes.LOAD_PROVEEDORES_SUCCESS,
    props<{ proveedores: Proveedor[] }>()
);
export const loadProveedoresFail = createAction(
    ProveedorActionTypes.LOAD_PROVEEDORES_FAIL,
    props<{ error: any }>()
);

export const createProveedorAction = createAction(
    ProveedorActionTypes.CREATE_PROVEEDOR,
    props<{ proveedor: ProveedorCreate }>()
);
export const createProveedorSuccess = createAction(
    ProveedorActionTypes.CREATE_PROVEEDOR_SUCCESS,
    props<{ proveedor: Proveedor }>()
);
export const createProveedorFail = createAction(
    ProveedorActionTypes.CREATE_PROVEEDOR_FAIL,
    props<{ error: any }>()
);

export const updateProveedorAction = createAction(
    ProveedorActionTypes.UPDATE_PROVEEDOR,
    props<{ proveedor: Proveedor }>()
);
export const updateProveedorSuccess = createAction(
    ProveedorActionTypes.UPDATE_PROVEEDOR_SUCCESS,
    props<{ proveedor: Proveedor }>()
);
export const updateProveedorFail = createAction(
    ProveedorActionTypes.UPDATE_PROVEEDOR_FAIL,
    props<{ error: any }>()
);

export const toggleProveedorAction = createAction(
    ProveedorActionTypes.TOGGLE_PROVEEDOR,
    props<{ proveedor: Proveedor; activo: boolean }>()
);
export const toggleProveedorSuccess = createAction(
    ProveedorActionTypes.TOGGLE_PROVEEDOR_SUCCESS,
    props<{ response: ToggleProveedorResponse }>()
);
export const toggleProveedorFail = createAction(
    ProveedorActionTypes.TOGGLE_PROVEEDOR_FAIL,
    props<{ error: any }>()
);
