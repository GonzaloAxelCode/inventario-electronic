import { Inventario } from '@/app/models/inventario.models';
import { createReducer, on } from '@ngrx/store';
import {
    actualizarInventario,
    actualizarInventarioFail,
    actualizarInventarioSuccess,
    clearSearchInventarios,
    createInventario,
    createInventarioFail,
    createInventarioSuccess,
    eliminarInventarioAction,
    eliminarInventarioFail,
    eliminarInventarioSuccess,
    loadInventarios,
    loadInventariosFail,
    loadInventariosSuccess,
    searchInventarioFail,
    searchInventarios,
    searchInventarioSuccess,
    updateStock,
    updateStockFail,
    updateStockSuccess,
    verificarStock,
    verificarStockFail,
    verificarStockSuccess
} from '../actions/inventario.actions';
export interface InventarioState {
    search_products_found: string;
    count: number;
    next: any;
    previous: any;
    inventarios: Inventario[];
    loading: boolean;
    errors: any;
    index_page: any;
    length_pages: any;
    loadingProductosInventario: boolean;
    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDeactivate: boolean;
    loadingDelete: boolean;
    loadingSearch: boolean;
    productos_search: Inventario[];
}

const initialState: InventarioState = {
    search_products_found: "",  // Inicializa como string vacío si es que no hay un valor predeterminado
    count: 0,
    next: null,
    previous: null,
    inventarios: [],  // Inicializa como un array vacío
    loading: false,
    errors: {},  // Inicializa como un objeto vacío
    index_page: null,
    length_pages: null,
    loadingProductosInventario: false,
    loadingCreate: false,
    loadingUpdate: false,
    loadingDeactivate: false,
    loadingDelete: false,
    loadingSearch: false,
    productos_search: []  // Inicializa como un array vacío
};
export const inventarioReducer = createReducer(
    initialState,


    on(loadInventarios, state => ({
        ...state,
        loadingProductosInventario: true
    })),
    on(loadInventariosSuccess, (state, { inventarios, next, previous, index_page, length_pages }) => ({
        ...state,
        inventarios,
        next, previous, index_page, length_pages,
        loadingProductosInventario: false
    })),
    on(loadInventariosFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingProductosInventario: false
    })),


    on(createInventario, state => ({
        ...state,
        loading: true
    })),
    on(createInventarioSuccess, (state, { inventario }) => ({
        ...state,
        inventarios: [...state.inventarios, inventario],
        loading: false
    })),
    on(createInventarioFail, (state, { error }) => ({
        ...state,
        errors: error,
        loading: false
    })),


    on(updateStock, state => ({
        ...state,
        loading: true
    })),
    on(updateStockSuccess, (state, { inventario }) => ({
        ...state,
        inventarios: state.inventarios.map(i => i.id === inventario.id ? inventario : i),
        loading: false
    })),
    on(updateStockFail, (state, { error }) => ({
        ...state,
        errors: error,
        loading: false
    })),


    on(actualizarInventario, state => ({
        ...state,
        loading: true
    })),
    on(actualizarInventarioSuccess, (state, { newInventario }) => ({
        ...state,

        inventarios: state.inventarios.map(i =>
            i.id === newInventario.id ? { ...i, ...newInventario } : i
        ),
        loading: false
    })),
    on(actualizarInventarioFail, (state, { error }) => ({
        ...state,
        errors: error,
        loading: false
    })),


    on(verificarStock, state => ({
        ...state,
        loading: true
    })),
    on(verificarStockSuccess, (state, { inventario }) => ({
        ...state,
        inventarios: state.inventarios.map(i => i.id === inventario.id ? inventario : i),
        loading: false
    })),
    on(verificarStockFail, (state, { error }) => ({
        ...state,
        errors: error,
        loading: false
    })),

    on(eliminarInventarioAction, state => ({
        ...state,
        loading: true
    })),
    on(eliminarInventarioSuccess, (state, { inventarioId }) => ({
        ...state,
        inventarios: state.inventarios.filter(i => inventarioId !== i.id),
        loading: false
    })),
    on(eliminarInventarioFail, (state, { error }) => ({
        ...state,
        errors: error,
        loading: false
    })),
    //search
    on(searchInventarios, state => ({
        ...state,
        loadingSearch: true
    })),
    on(searchInventarioSuccess, (state, { inventarios, search_products_found, count, next, previous, index_page, length_pages }) => ({
        ...state,
        productos_search: inventarios,
        loadingSearch: false,
        search_products_found: search_products_found,
        count: count,
        next, previous, index_page, length_pages
    })),
    on(searchInventarioFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingSearch: false
    })),
    on(clearSearchInventarios, (state) => ({
        ...state,
        count: 0,
        loadingSearch: false,
        productos_search: [],
        search_products_found: ""
    }))
);

