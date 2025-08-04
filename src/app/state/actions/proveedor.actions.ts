import { Proveedor, ProveedorCreate } from '@/app/models/proveedor.models';
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
    DELETE_PROVEEDOR = '[Proveedor] Delete Proveedor',
    DELETE_PROVEEDOR_SUCCESS = '[Proveedor] Delete Proveedor Success',
    DELETE_PROVEEDOR_FAIL = '[Proveedor] Delete Proveedor Fail'
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

export const deleteProveedorAction = createAction(
    ProveedorActionTypes.DELETE_PROVEEDOR,
    props<{ id: number }>()
);
export const deleteProveedorSuccess = createAction(
    ProveedorActionTypes.DELETE_PROVEEDOR_SUCCESS,
    props<any>()
);
export const deleteProveedorFail = createAction(
    ProveedorActionTypes.DELETE_PROVEEDOR_FAIL,
    props<{ error: any }>()
);