import { DistribucionStock, Inventario, InventarioCreate, RangoPrecio, TopCategoriaCompra, ValorizacionCategoria } from '@/app/models/inventario.models';
import { QuerySearchInventario } from '@/app/services/inventario.service';
import { createAction, props } from '@ngrx/store';
import { InventarioLowStock } from '../reducers/inventario.reducer';

export enum InventarioActionTypes {
    LOAD_INVENTARIOS = '[Inventario] Load Inventarios',
    LOAD_INVENTARIOS_SUCCESS = '[Inventario] Load Inventarios Success',
    LOAD_INVENTARIOS_FAIL = '[Inventario] Load Inventarios Fail',

    CREATE_INVENTARIO = '[Inventario] Create Inventario',
    CREATE_INVENTARIO_SUCCESS = '[Inventario] Create Inventario Success',
    CREATE_INVENTARIO_FAIL = '[Inventario] Create Inventario Fail',

    UPDATE_STOCK = '[Inventario] Update Stock',
    UPDATE_STOCK_SUCCESS = '[Inventario] Update Stock Success',
    UPDATE_STOCK_FAIL = '[Inventario] Update Stock Fail',
    UPDATE_STOCK_MULTIPLE = '[Inventario] Update Stock Multiple',
    ACTUALIZAR_INVENTARIO = '[Inventario] Actualizacion',
    ACTUALIZAR_INVENTARIO_SUCCESS = '[Inventario] Actualizacion Success',
    ACTUALIZAR_INVENTARIO_FAIL = '[Inventario] Actualizacion Fail',
    CARGAR_PRODUCTOS_MENOR_STOCK = '[Inventario] Cargar productos con menor stock',
    CARGAR_PRODUCTOS_MENOR_STOCK_SUCCESS = '[Inventario] Cargar productos con menor stock Success',
    CARGAR_PRODUCTOS_MENOR_STOCK_FAILURE = '[Inventario] Cargar productos con menor stock Failure',


    VERIFICAR_STOCK = '[Inventario] Verificar Stock',
    VERIFICAR_STOCK_SUCCESS = '[Inventario] Verificar Stock Success',
    VERIFICAR_STOCK_FAIL = '[Inventario] Verificar Stock Fail',
    ELIMINAR_INVENTARIO = '[Inventario] Eliminar Inventario',
    ELIMINAR_INVENTARIO_SUCCESS = '[Inventario] Eliminar Inventario Success',
    ELIMINAR_INVENTARIO_FAIL = '[Inventario] Eliminar Inventario Fail',


    SEARCH_INVENTARIOS = 'SEARCH_INVENTARIOS',
    SEARCH_INVENTARIOS_SUCCESS = 'SEARCH_INVENTARIOS_SUCCESS',
    SEARCH_INVENTARIOS_FAIL = 'SEARCH_INVENTARIOS_FAIL',
    CLEAR_SEARCH_INVENTARIOS = 'CLEAR_INVENTARIOS_PRODUCTOS',

    LOAD_DISTRIBUCION_STOCK = '[Inventario] Load Distribucion Stock',
    LOAD_DISTRIBUCION_STOCK_SUCCESS = '[Inventario] Load Distribucion Stock Success',
    LOAD_DISTRIBUCION_STOCK_FAIL = '[Inventario] Load Distribucion Stock Fail',

    LOAD_POR_RANGO_PRECIOS = '[Inventario] Load Por Rango Precios',
    LOAD_POR_RANGO_PRECIOS_SUCCESS = '[Inventario] Load Por Rango Precios Success',
    LOAD_POR_RANGO_PRECIOS_FAIL = '[Inventario] Load Por Rango Precios Fail',

    LOAD_VALORIZACION = '[Inventario] Load Valorizacion',
    LOAD_VALORIZACION_SUCCESS = '[Inventario] Load Valorizacion Success',
    LOAD_VALORIZACION_FAIL = '[Inventario] Load Valorizacion Fail',

    LOAD_TOP_CATEGORIAS_COMPRA = '[Inventario] Load Top Categorias Compra',
    LOAD_TOP_CATEGORIAS_COMPRA_SUCCESS = '[Inventario] Load Top Categorias Compra Success',
    LOAD_TOP_CATEGORIAS_COMPRA_FAIL = '[Inventario] Load Top Categorias Compra Fail',


}

export const loadInventariosFromCache = createAction(
    '[Inventario] Load From Cache'
);
export const clearInventariosFromCache = createAction(
    '[Inventario] Clear From Cache'
);
export const forceSyncInventarios = createAction(
    '[Inventario] Force Sync'
);


export const loadInventarios = createAction(
    InventarioActionTypes.LOAD_INVENTARIOS,

);
export const loadInventariosSuccess = createAction(
    InventarioActionTypes.LOAD_INVENTARIOS_SUCCESS,
    props<{ inventarios: Inventario[] }>()
);
export const loadInventariosFail = createAction(
    InventarioActionTypes.LOAD_INVENTARIOS_FAIL,
    props<{ error: any }>()
);

export const createInventario = createAction(
    InventarioActionTypes.CREATE_INVENTARIO,
    props<{ inventario: InventarioCreate }>()
);
export const createInventarioSuccess = createAction(
    InventarioActionTypes.CREATE_INVENTARIO_SUCCESS,
    props<{ inventario: Inventario }>()
);
export const createInventarioFail = createAction(
    InventarioActionTypes.CREATE_INVENTARIO_FAIL,
    props<{ error: any }>()
);


export const updateStock = createAction(
    InventarioActionTypes.UPDATE_STOCK,
    props<{ inventarioId: number; cantidad: number }>()
);
export const updateStockSuccess = createAction(
    InventarioActionTypes.UPDATE_STOCK_SUCCESS,
    props<{ inventario: Inventario }>()
);
export const updateStockFail = createAction(
    InventarioActionTypes.UPDATE_STOCK_FAIL,
    props<{ error: any }>()
);

export const updateStockMultiple = createAction(
    InventarioActionTypes.UPDATE_STOCK_MULTIPLE,
    props<{ productos: { inventarioId: number; cantidad_final: string }[] }>()
);
export const actualizarInventario = createAction(
    InventarioActionTypes.ACTUALIZAR_INVENTARIO,
    props<{ newInventario: Partial<Inventario> }>()
);
export const actualizarInventarioSuccess = createAction(
    InventarioActionTypes.ACTUALIZAR_INVENTARIO_SUCCESS,
    props<{ newInventario: Partial<Inventario> }>()
);
export const actualizarInventarioFail = createAction(
    InventarioActionTypes.ACTUALIZAR_INVENTARIO_FAIL,
    props<{ error: any }>()
);



export const searchInventarios = createAction(
    InventarioActionTypes.SEARCH_INVENTARIOS,
    props<{ inventarios: Inventario[], query: Partial<QuerySearchInventario> }>()
);
export const searchInventarioSuccess = createAction(
    InventarioActionTypes.SEARCH_INVENTARIOS_SUCCESS,
    props<{ inventarios_search: Inventario[], search_found: boolean }>()
);
export const searchInventarioFail = createAction(
    InventarioActionTypes.SEARCH_INVENTARIOS_FAIL,
    props<{ error: any }>()
);




export const verificarStock = createAction(
    InventarioActionTypes.VERIFICAR_STOCK,
    props<{ inventarioId: number }>()
);
export const verificarStockSuccess = createAction(
    InventarioActionTypes.VERIFICAR_STOCK_SUCCESS,
    props<{ estado: string; inventario: Inventario }>()
);
export const verificarStockFail = createAction(
    InventarioActionTypes.VERIFICAR_STOCK_FAIL,
    props<{ error: any }>()
);

export const eliminarInventarioAction = createAction(
    InventarioActionTypes.ELIMINAR_INVENTARIO,
    props<{ inventarioId: number }>()
);
export const eliminarInventarioSuccess = createAction(
    InventarioActionTypes.ELIMINAR_INVENTARIO_SUCCESS,
    props<{ inventarioId: number }>()
);
export const eliminarInventarioFail = createAction(
    InventarioActionTypes.ELIMINAR_INVENTARIO_FAIL,
    props<{ error: any }>()
);
export const clearSearchInventarios = createAction(

    InventarioActionTypes.CLEAR_SEARCH_INVENTARIOS
);



export const cargarProductosMenorStock = createAction(
    InventarioActionTypes.CARGAR_PRODUCTOS_MENOR_STOCK,

);

export const cargarProductosMenorStockSuccess = createAction(
    InventarioActionTypes.CARGAR_PRODUCTOS_MENOR_STOCK_SUCCESS,
    props<{ lowStockProducts: InventarioLowStock[] }>()
);

export const cargarProductosMenorStockFailure = createAction(
    InventarioActionTypes.CARGAR_PRODUCTOS_MENOR_STOCK_FAILURE,
    props<{ error: any }>()
);

export const loadDistribucionStock = createAction(
    InventarioActionTypes.LOAD_DISTRIBUCION_STOCK
);
export const loadDistribucionStockSuccess = createAction(
    InventarioActionTypes.LOAD_DISTRIBUCION_STOCK_SUCCESS,
    props<{ distribucion: DistribucionStock }>()
);
export const loadDistribucionStockFail = createAction(
    InventarioActionTypes.LOAD_DISTRIBUCION_STOCK_FAIL,
    props<{ error: any }>()
);

export const loadValorizacion = createAction(
    InventarioActionTypes.LOAD_VALORIZACION
);
export const loadValorizacionSuccess = createAction(
    InventarioActionTypes.LOAD_VALORIZACION_SUCCESS,
    props<{ valorizacion: ValorizacionCategoria[] }>()
);
export const loadValorizacionFail = createAction(
    InventarioActionTypes.LOAD_VALORIZACION_FAIL,
    props<{ error: any }>()
);

export const loadTopCategoriasCompra = createAction(
    InventarioActionTypes.LOAD_TOP_CATEGORIAS_COMPRA
);
export const loadTopCategoriasCompraSuccess = createAction(
    InventarioActionTypes.LOAD_TOP_CATEGORIAS_COMPRA_SUCCESS,
    props<{ topCategorias: TopCategoriaCompra[] }>()
);
export const loadTopCategoriasCompraFail = createAction(
    InventarioActionTypes.LOAD_TOP_CATEGORIAS_COMPRA_FAIL,
    props<{ error: any }>()
);