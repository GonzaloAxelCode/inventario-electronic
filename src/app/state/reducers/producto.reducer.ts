import { Producto, ProductoState } from '@/app/models/producto.models';
import { createReducer, on } from '@ngrx/store';
import {
    actualizarInventarioWithProductsSuccess,
    clearSearchProductos,
    createProductoAction,
    createProductoFail,
    createProductoSuccess,
    deactivateProductoAction,
    deactivateProductoFail,
    deactivateProductoSuccess,
    deleteProductoAction,
    deleteProductoFail,
    deleteProductoSuccess,
    loadProductosAction,
    loadProductosFail,
    loadProductosSuccess,
    searchProductoFail,
    searchProductosAction,
    searchProductoSuccess,
    updateProductoAction,
    updateProductoFail,
    updateProductoSuccess
} from '../actions/producto.actions';

const initialState: ProductoState = {
    search_found: false,
    count: 0,
    next: null,
    previous: null, search_products_found: "",
    productos: [],
    index_page: null,
    length_pages: null,
    loadingProductos: false,
    errors: {},
    loadingCreate: false,
    loadingUpdate: false,
    loadingDeactivate: false,
    loadingDelete: false,
    loadingSearch: false,
    productos_search: [],

};

export const productoReducer = createReducer(
    initialState,

    // Carga de productos
    on(loadProductosAction, state => ({
        ...state,
        loadingProductos: true,


    })),
    on(loadProductosSuccess, (state, { productos, next, previous, index_page, length_pages, count }) => ({
        ...state,
        productos,
        loadingProductos: false,
        next, previous, index_page, length_pages, count


    })),
    on(loadProductosFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingProductos: false,

    })),

    // Creación de producto
    on(createProductoAction, state => ({
        ...state,
        loadingCreate: true
    })),
    on(createProductoSuccess, (state, { producto }) => ({
        ...state,
        productos: [...state.productos, { ...producto }],
        loadingCreate: false
    })),
    on(createProductoFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingCreate: false
    })),

    // Actualización de producto
    on(updateProductoAction, state => ({
        ...state,
        loadingUpdate: true
    })),
    on(updateProductoSuccess, (state, { producto }) => ({
        ...state,
        productos: state.productos.map(p => p.id === producto.id ? producto : p),
        loadingUpdate: false
    })),
    on(updateProductoFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingUpdate: false
    })),

    // Desactivación de producto
    on(deactivateProductoAction, state => ({
        ...state,
        loadingDeactivate: true
    })),
    on(deactivateProductoSuccess, (state, { id }) => ({
        ...state,
        productos: state.productos.filter(p => p.id !== id),
        loadingDeactivate: false
    })),
    on(deactivateProductoFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingDeactivate: false
    })),

    // Eliminación de producto
    on(deleteProductoAction, state => ({
        ...state,
        loadingDelete: true
    })),
    on(deleteProductoSuccess, (state, { id }) => ({
        ...state,
        productos: state.productos.filter(p => p.id !== id),
        loadingDelete: false
    })),
    on(deleteProductoFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingDelete: false
    })),
    //search
    on(searchProductosAction, state => ({
        ...state,
        loadingSearch: true
    })),
    on(searchProductoSuccess, (state, { productos, search_products_found, count, next, previous, index_page, length_pages }) => ({
        ...state,
        productos_search: productos,
        loadingSearch: false,
        search_products_found: search_products_found,
        count: count,
        next, previous, index_page, length_pages
    })),
    on(searchProductoFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingSearch: false
    })),
    on(clearSearchProductos, (state) => ({
        ...state,
        count: 0,
        loadingSearch: false,
        productos_search: [],
        search_found: false
    })),
    on(actualizarInventarioWithProductsSuccess, (state, { idProduct, newInventario }) => ({
        ...state,
        productos: state.productos.map((p: Producto) => p.id === idProduct ? { ...p, inventario: { ...p.inventario, ...newInventario } } : p)
    }))
);

