import { Pedido } from '@/app/models/pedido.models';
import { createReducer, on } from '@ngrx/store';
import {
    cargarPedidos,
    cargarPedidosExito,
    cargarPedidosError,
    buscarPedidos,
    buscarPedidosExito,
    buscarPedidosError,
    crearPedido,
    crearPedidoExito,
    crearPedidoError,
    cancelarPedido,
    cancelarPedidoExito,
    cancelarPedidoError,
} from '../actions/pedido.actions';

export interface PedidoState {
    pedidos: Pedido[];
    loading: boolean;
    error: any;
    count: number;
    next: number | null;
    previous: number | null;
    index_page: number;
    length_pages: number;
    loadingCreate: boolean;
    loadingCancel: boolean;
}

export const initialState: PedidoState = {
    pedidos: [],
    loading: false,
    error: null,
    count: 0,
    next: null,
    previous: null,
    index_page: 0,
    length_pages: 0,
    loadingCreate: false,
    loadingCancel: false,
};

export const pedidoReducer = createReducer(
    initialState,
    on(cargarPedidos, (state) => ({
        ...state,
        loading: true,
    })),
    on(cargarPedidosExito, (state, { pedidos, count }) => ({
        ...state,
        pedidos,
        count,
        loading: false,
    })),
    on(cargarPedidosError, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),
    on(buscarPedidos, (state) => ({
        ...state,
        loading: true,
    })),
    on(buscarPedidosExito, (state, { pedidos, count, next, previous, index_page, length_pages }) => ({
        ...state,
        pedidos,
        count,
        next,
        previous,
        index_page,
        length_pages,
        loading: false,
    })),
    on(buscarPedidosError, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),
    on(crearPedido, (state) => ({
        ...state,
        loadingCreate: true,
    })),
    on(crearPedidoExito, (state, { pedido }) => ({
        ...state,
        pedidos: [pedido, ...state.pedidos],
        count: state.count + 1,
        loadingCreate: false,
    })),
    on(crearPedidoError, (state, { error }) => ({
        ...state,
        error,
        loadingCreate: false,
    })),
    on(cancelarPedido, (state) => ({
        ...state,
        loadingCancel: true,
    })),
    on(cancelarPedidoExito, (state, { pedidoId, mensaje }) => ({
        ...state,
        pedidos: state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, estado: 'CANCELADO' as const, activo: false } : p
        ),
        loadingCancel: false,
    })),
    on(cancelarPedidoError, (state, { error }) => ({
        ...state,
        error,
        loadingCancel: false,
    })),
);
