import { Inventario } from '@/app/models/inventario.models';
import { Producto } from '@/app/models/producto.models';
import { createReducer, on } from '@ngrx/store';
import {
    actualizarInventario,
    actualizarInventarioFail,
    actualizarInventarioSuccess,
    cargarProductosMenorStock,
    cargarProductosMenorStockFailure,
    cargarProductosMenorStockSuccess,
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
    updateStockMultiple,
    updateStockSuccess,
    verificarStock,
    verificarStockFail,
    verificarStockSuccess
} from '../actions/inventario.actions';
export interface InventarioLowStock {
    item: Producto
    inventario: Inventario
}
export interface InventarioState {
    search_found: boolean;
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
    inventarios_search: Inventario[];
    lowStockProducts: InventarioLowStock[],
    loadingLowStock: boolean
}

const initialState: InventarioState = {
    search_found: false,  // Inicializa como string vacío si es que no hay un valor predeterminado
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

    lowStockProducts: [] as unknown as InventarioLowStock[],
    loadingLowStock: false,
    inventarios_search: []  // Inicializa como un array vacío
};
export const inventarioReducer = createReducer(
    initialState,


    on(loadInventarios, state => ({
        ...state,
        loadingProductosInventario: true
    })),
    on(loadInventariosSuccess, (state, { inventarios }) => ({
        ...state,
        inventarios,
        loadingProductosInventario: false
    })),
    on(loadInventariosFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingProductosInventario: false
    })),


    on(createInventario, state => ({
        ...state,
        loadingCreate: true
    })),
    on(createInventarioSuccess, (state, { inventario }) => ({
        ...state,
        inventarios: [...state.inventarios, inventario],
        loadingCreate: false
    })),
    on(createInventarioFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingCreate: false
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

    on(updateStockMultiple, (state, { productos = [] }) => ({

        ...state,
        inventarios: state.inventarios.map(inventario => {
            const productoToUpdate = productos.find(p => p.inventarioId === inventario.id);

            if (!productoToUpdate) return inventario;

            const cantidadRestar = parseInt(productoToUpdate.cantidad_final) || 0;

            return {
                ...inventario,
                cantidad: inventario.cantidad - cantidadRestar
            };
        })
    })),

    on(actualizarInventario, state => ({
        ...state,
        loading: true
    })),
    on(actualizarInventarioSuccess, (state, { newInventario }) => ({
        ...state,
        inventarios: state.inventarios
            .map(i => i.id === newInventario.id ? { ...i, ...newInventario } : i)
            .sort((a, b) => Date.parse(b.date_created) - Date.parse(a.date_created)),
        loading: false,
    })),

    on(actualizarInventarioFail, (state, { error }) => {

        return {
            ...state,
            errors: error,
            loading: false
        }
    }),


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
        loadingDelete: true
    })),
    on(eliminarInventarioSuccess, (state, { inventarioId }) => ({
        ...state,
        inventarios: state.inventarios.filter(i => inventarioId !== i.id),
        loadingDelete: false
    })),
    on(eliminarInventarioFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingDelete: false
    })),
    //search
    on(searchInventarios, state => ({
        ...state,
        loadingSearch: true
    })),
    on(searchInventarioSuccess, (state, { inventarios_search, search_found }) => ({
        ...state,
        inventarios_search: inventarios_search,
        search_found: search_found

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
        inventarios_search: [],
        search_found: false
    })),
    on(cargarProductosMenorStock, (state) => ({
        ...state,
        loadingLowStock: true,
        error: null,
    })),

    on(cargarProductosMenorStockSuccess, (state, { lowStockProducts }) => ({
        ...state,
        lowStockProducts: lowStockProducts,
        loadingLowStock: false,
    })),

    on(cargarProductosMenorStockFailure, (state, { error }) => ({
        ...state,
        errorLowStock: error,
        loadingLowStock: false,
    })),

    //externos

);

