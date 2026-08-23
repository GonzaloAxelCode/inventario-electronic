import { ComprobanteCompra, CreateCompra } from '@/app/models/compra.models';
import { QuerySearchCompra } from '@/app/services/compra.service';
import { createAction, props } from '@ngrx/store';

export enum CompraActionTypes {
    CARGAR_COMPRAS = '[Compra] Cargar Compras',
    CARGAR_COMPRAS_EXITO = '[Compra] Cargar Compras Exito',
    CARGAR_COMPRAS_ERROR = '[Compra] Cargar Compras Error',

    CREAR_COMPRA = '[Compra] Crear Compra',
    CREAR_COMPRA_EXITO = '[Compra] Crear Compra Exito',
    CREAR_COMPRA_ERROR = '[Compra] Crear Compra Error',

    SEARCH_COMPRAS = '[Compra] Search Compras',
    SEARCH_COMPRAS_EXITO = '[Compra] Search Compras Exito',
    SEARCH_COMPRAS_ERROR = '[Compra] Search Compras Error',

    CLEAR_SEARCH_COMPRAS = '[Compra] Clear Search Compras',
}

export const cargarCompras = createAction(
    CompraActionTypes.CARGAR_COMPRAS,
    props<{ page?: number; page_size?: number }>()
);

export const cargarComprasExito = createAction(
    CompraActionTypes.CARGAR_COMPRAS_EXITO,
    props<{
        comprobantes: ComprobanteCompra[];
        count: number;
        next: any;
        previous: any;
        index_page: any;
        length_pages: any;
    }>()
);

export const cargarComprasError = createAction(
    CompraActionTypes.CARGAR_COMPRAS_ERROR,
    props<{ error: any }>()
);

export const crearCompra = createAction(
    CompraActionTypes.CREAR_COMPRA,
    props<{ compra: CreateCompra }>()
);

export const crearCompraExito = createAction(
    CompraActionTypes.CREAR_COMPRA_EXITO,
    props<{ comprobante: ComprobanteCompra }>()
);

export const crearCompraError = createAction(
    CompraActionTypes.CREAR_COMPRA_ERROR,
    props<{ error: any }>()
);

export const searchCompras = createAction(
    CompraActionTypes.SEARCH_COMPRAS,
    props<{ query: Partial<QuerySearchCompra>; page?: number; page_size?: number }>()
);

export const searchComprasExito = createAction(
    CompraActionTypes.SEARCH_COMPRAS_EXITO,
    props<{
        comprobantes: ComprobanteCompra[];
        count: number;
        next: any;
        previous: any;
        index_page: any;
        length_pages: any;
    }>()
);

export const searchComprasError = createAction(
    CompraActionTypes.SEARCH_COMPRAS_ERROR,
    props<{ error: any }>()
);

export const clearSearchCompras = createAction(
    CompraActionTypes.CLEAR_SEARCH_COMPRAS
);
