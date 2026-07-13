import { Pedido, PedidoSearchFilters, CreatePedido } from '@/app/models/pedido.models';
import { createAction, props } from '@ngrx/store';

export enum PedidoActionTypes {
    CARGAR_PEDIDOS = '[Pedido] Cargar Pedidos',
    CARGAR_PEDIDOS_EXITO = '[Pedido] Cargar Pedidos Exito',
    CARGAR_PEDIDOS_ERROR = '[Pedido] Cargar Pedidos Error',

    BUSCAR_PEDIDOS = '[Pedido] Buscar Pedidos',
    BUSCAR_PEDIDOS_EXITO = '[Pedido] Buscar Pedidos Exito',
    BUSCAR_PEDIDOS_ERROR = '[Pedido] Buscar Pedidos Error',

    CREAR_PEDIDO = '[Pedido] Crear Pedido',
    CREAR_PEDIDO_EXITO = '[Pedido] Crear Pedido Exito',
    CREAR_PEDIDO_ERROR = '[Pedido] Crear Pedido Error',

    CANCELAR_PEDIDO = '[Pedido] Cancelar Pedido',
    CANCELAR_PEDIDO_EXITO = '[Pedido] Cancelar Pedido Exito',
    CANCELAR_PEDIDO_ERROR = '[Pedido] Cancelar Pedido Error',
}

export const cargarPedidos = createAction(
    PedidoActionTypes.CARGAR_PEDIDOS,
    props<{ fromDate: string; toDate: string }>()
);

export const cargarPedidosExito = createAction(
    PedidoActionTypes.CARGAR_PEDIDOS_EXITO,
    props<{ pedidos: Pedido[]; count: number }>()
);

export const cargarPedidosError = createAction(
    PedidoActionTypes.CARGAR_PEDIDOS_ERROR,
    props<{ error: any }>()
);

export const buscarPedidos = createAction(
    PedidoActionTypes.BUSCAR_PEDIDOS,
    props<{ page?: number; page_size?: number; filters?: PedidoSearchFilters }>()
);

export const buscarPedidosExito = createAction(
    PedidoActionTypes.BUSCAR_PEDIDOS_EXITO,
    props<{
        pedidos: Pedido[];
        count: number;
        next: number | null;
        previous: number | null;
        index_page: number;
        length_pages: number;
    }>()
);

export const buscarPedidosError = createAction(
    PedidoActionTypes.BUSCAR_PEDIDOS_ERROR,
    props<{ error: any }>()
);

export const crearPedido = createAction(
    PedidoActionTypes.CREAR_PEDIDO,
    props<{ pedido: CreatePedido }>()
);

export const crearPedidoExito = createAction(
    PedidoActionTypes.CREAR_PEDIDO_EXITO,
    props<{ pedido: Pedido }>()
);

export const crearPedidoError = createAction(
    PedidoActionTypes.CREAR_PEDIDO_ERROR,
    props<{ error: any }>()
);

export const cancelarPedido = createAction(
    PedidoActionTypes.CANCELAR_PEDIDO,
    props<{ pedidoId: number }>()
);

export const cancelarPedidoExito = createAction(
    PedidoActionTypes.CANCELAR_PEDIDO_EXITO,
    props<{ pedidoId: number; mensaje: string }>()
);

export const cancelarPedidoError = createAction(
    PedidoActionTypes.CANCELAR_PEDIDO_ERROR,
    props<{ error: any }>()
);
