import { ComprobanteCompra } from '@/app/models/compra.models';
import { createReducer, on } from '@ngrx/store';
import {
    cargarCompras,
    cargarComprasExito,
    cargarComprasError,
    crearCompra,
    crearCompraExito,
    crearCompraError,
} from '../actions/compra.actions';

export interface CompraState {
    comprobantes: ComprobanteCompra[];
    loading: boolean;
    error: any;
    count: number;
    next: any;
    previous: any;
    index_page: any;
    length_pages: any;
    loadingCreate: boolean;
}

export const initialState: CompraState = {
    comprobantes: [],
    loading: false,
    error: null,
    count: 0,
    next: null,
    previous: null,
    index_page: null,
    length_pages: null,
    loadingCreate: false,
};

export const compraReducer = createReducer(
    initialState,
    on(cargarCompras, (state) => ({
        ...state,
        loading: true,
    })),
    on(cargarComprasExito, (state, { comprobantes, count, next, previous, index_page, length_pages }) => ({
        ...state,
        comprobantes,
        count,
        next,
        previous,
        index_page,
        length_pages,
        loading: false,
    })),
    on(cargarComprasError, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),
    on(crearCompra, (state) => ({
        ...state,
        loadingCreate: true,
    })),
    on(crearCompraExito, (state, { comprobante }) => ({
        ...state,
        comprobantes: [comprobante, ...state.comprobantes],
        loadingCreate: false,
    })),
    on(crearCompraError, (state, { error }) => ({
        ...state,
        error,
        loadingCreate: false,
    })),
);
