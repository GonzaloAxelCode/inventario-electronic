import { Producto } from '@/app/models/producto.models';
import { QuerySearchProduct } from '@/app/services/utils/querys';
import { createAction, props } from '@ngrx/store';

export enum ActionTypes {
    LOAD_PRODUCTOS = 'LOAD_PRODUCTOS',
    LOAD_PRODUCTOS_SUCCESS = 'LOAD_PRODUCTOS_SUCCESS',
    LOAD_PRODUCTOS_FAIL = 'LOAD_PRODUCTOS_FAIL',
    CREATE_PRODUCTO = 'CREATE_PRODUCTO',
    CREATE_PRODUCTO_SUCCESS = 'CREATE_PRODUCTO_SUCCESS',
    CREATE_PRODUCTO_FAIL = 'CREATE_PRODUCTO_FAIL',
    UPDATE_PRODUCTO = 'UPDATE_PRODUCTO',
    UPDATE_PRODUCTO_SUCCESS = 'UPDATE_PRODUCTO_SUCCESS',
    UPDATE_PRODUCTO_FAIL = 'UPDATE_PRODUCTO_FAIL',
    DEACTIVATE_PRODUCTO = 'DEACTIVATE_PRODUCTO',
    DEACTIVATE_PRODUCTO_SUCCESS = 'DEACTIVATE_PRODUCTO_SUCCESS',
    DEACTIVATE_PRODUCTO_FAIL = 'DEACTIVATE_PRODUCTO_FAIL',
    DELETE_PRODUCTO = 'DELETE_PRODUCTO',
    DELETE_PRODUCTO_SUCCESS = 'DELETE_PRODUCTO_SUCCESS',
    DELETE_PRODUCTO_FAIL = 'DELETE_PRODUCTO_FAIL',

    SEARCH_PRODUCTOS = 'SEARCH_PRODUCTOS_PRODUCTO',
    SEARCH_PRODUCTOS_SUCCESS = 'SEARCH_PRODUCTOS_SUCCESS',
    SEARCH_PRODUCTOS_FAIL = 'SEARCH_PRODUCTOS_FAIL',
    CLEAR_SEARCH_PRODUCTOS = 'CLEAR_SEARCH_PRODUCTOS',
}

export const loadProductosAction = createAction(
    ActionTypes.LOAD_PRODUCTOS,

);

export const loadProductosSuccess = createAction(
    ActionTypes.LOAD_PRODUCTOS_SUCCESS,
    props<{ productos: Producto[] }>()
);

export const loadProductosFail = createAction(
    ActionTypes.LOAD_PRODUCTOS_FAIL,
    props<{ error: any }>()
);

export const createProductoAction = createAction(
    ActionTypes.CREATE_PRODUCTO,
    props<{ producto: FormData }>()
);

export const createProductoSuccess = createAction(
    ActionTypes.CREATE_PRODUCTO_SUCCESS,
    props<{ producto: Producto }>()
);

export const createProductoFail = createAction(
    ActionTypes.CREATE_PRODUCTO_FAIL,
    props<{ error: any }>()
);

export const updateProductoAction = createAction(
    ActionTypes.UPDATE_PRODUCTO,
    props<{ producto: FormData }>()
);

export const updateProductoSuccess = createAction(
    ActionTypes.UPDATE_PRODUCTO_SUCCESS,
    props<{ producto: Producto }>()
);

export const updateProductoFail = createAction(
    ActionTypes.UPDATE_PRODUCTO_FAIL,
    props<{ error: any }>()
);

export const deactivateProductoAction = createAction(
    ActionTypes.DEACTIVATE_PRODUCTO,
    props<{ id: number, activo: boolean }>()
);

export const deactivateProductoSuccess = createAction(
    ActionTypes.DEACTIVATE_PRODUCTO_SUCCESS,
    props<{ id: number }>()
);

export const deactivateProductoFail = createAction(
    ActionTypes.DEACTIVATE_PRODUCTO_FAIL,
    props<{ error: any }>()
);

export const deleteProductoAction = createAction(
    ActionTypes.DELETE_PRODUCTO,
    props<{ id: number }>()
);

export const deleteProductoSuccess = createAction(
    ActionTypes.DELETE_PRODUCTO_SUCCESS,
    props<{ id: number }>()
);

export const deleteProductoFail = createAction(
    ActionTypes.DELETE_PRODUCTO_FAIL,
    props<{ error: any }>()
);

export const searchProductosAction = createAction(
    ActionTypes.SEARCH_PRODUCTOS,
    props<{ query: Partial<QuerySearchProduct>, products: Producto[] }>()
);

export const searchProductoSuccess = createAction(
    ActionTypes.SEARCH_PRODUCTOS_SUCCESS,
    props<{ productos_search: Producto[], search_found: boolean }>()
);

export const searchProductoFail = createAction(
    ActionTypes.SEARCH_PRODUCTOS_FAIL,
    props<{ error: any }>()
);
export const clearSearchProductos = createAction(
    ActionTypes.CLEAR_SEARCH_PRODUCTOS
);


