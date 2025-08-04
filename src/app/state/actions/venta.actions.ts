import { CreateVenta, Venta } from '@/app/models/venta.models';
import { QuerySearchVenta } from '@/app/services/caja.service';
import { createAction, props } from '@ngrx/store';
import { ProductsSales } from '../reducers/venta.reducer';



export enum VentaActionTypes {
    CARGAR_VENTAS_TIENDA = '[Venta] Cargar Ventas por Tienda',
    CARGAR_VENTAS_TIENDA_EXITO = '[Venta] Cargar Ventas por Tienda Éxito',
    CARGAR_VENTAS_TIENDA_ERROR = '[Venta] Cargar Ventas por Tienda Error',

    CREAR_VENTA = '[Venta] Crear Venta',
    CREAR_VENTA_EXITO = '[Venta] Crear Venta Éxito',
    CREAR_VENTA_ERROR = '[Venta] Crear Venta Error',
    CARGAR_RESUMEN_VENTAS = '[Venta] Cargar Resumen Ventas',
    CARGAR_RESUMEN_VENTAS_EXITO = '[Venta] Cargar Resumen Ventas Éxito',
    CARGAR_RESUMEN_VENTAS_ERROR = '[Venta] Cargar Resumen Ventas Error',
    CANCELAR_VENTA = '[Venta] Cancelar Venta',
    CANCELAR_VENTA_EXITO = '[Venta] Cancelar Venta Exito',
    CANCELAR_VENTA_ERROR = '[Venta] Cancelar Venta Error',
    CARGAR_VENTAS_RANGO_FECHAS_TIENDA = '[Venta] Cargar Ventas por Rango de Fechas y Tienda',
    CARGAR_VENTAS_RANGO_FECHAS_TIENDA_EXITO = '[Venta] Cargar Ventas por Rango de Fechas y Tienda Éxito',
    CARGAR_VENTAS_RANGO_FECHAS_TIENDA_ERROR = '[Venta] Cargar Ventas por Rango de Fechas y Tienda Error',
    CARGAR_TOP_PRODUCTOS_VENTAS = '[Venta] Cargar Top Productos Más Vendidos',
    CARGAR_TOP_PRODUCTOS_VENTAS_EXITO = '[Venta] Cargar Top Productos Más Vendidos Éxito',
    CARGAR_TOP_PRODUCTOS_VENTAS_ERROR = '[Venta] Cargar Top Productos Más Vendidos Error',
    CARGAR_PRODUCTOS_MENOR_STOCK = '[Inventario] Cargar productos con menor stock',
    CARGAR_PRODUCTOS_MENOR_STOCK_SUCCESS = '[Inventario] Cargar productos con menor stock Success',
    CARGAR_PRODUCTOS_MENOR_STOCK_FAILURE = '[Inventario] Cargar productos con menor stock Failure',
    CARGAR_RESUMEN_VENTAS_BY_DATE = '[Venta] Cargar Resumen Ventas por Mes o Día',
    CARGAR_RESUMEN_VENTAS_BY_DATE_EXITO = '[Venta] Cargar Resumen Ventas por Mes o Día Éxito',
    CARGAR_RESUMEN_VENTAS_BY_DATE_ERROR = '[Venta] Cargar Resumen Ventas por Mes o Día Error',
    CLEAR_VENTA_TEMPORAL = '[Venta] Limpiar venta temporal ',

    SEARCH_VENTA = "SEARCH_VENTA ",
    SEARCH_VENTA_SUCCESS = "SEARCH_VENTA SUCCESS",
    SEARCH_VENTA_FAIL = "SEARCH_VENTA FAIL",
    CLEAR_VENTA_SEARCH = "CLEAR_VENTA_SEARCH",


}
export const cargarResumenVentasByDate = createAction(
    VentaActionTypes.CARGAR_RESUMEN_VENTAS_BY_DATE,
    props<{ tiendaId: number, year: number, month: number | null, day: number | null, tipo: string }>()
);

export const cargarResumenVentasByDateExito = createAction(
    VentaActionTypes.CARGAR_RESUMEN_VENTAS_BY_DATE_EXITO,
    props<{
        todaySales: number | null,
        thisMonthSales: number | null,
        tipo: string
    }>()
);

export const cargarResumenVentasByDateError = createAction(
    VentaActionTypes.CARGAR_RESUMEN_VENTAS_BY_DATE_ERROR,
    props<{ error: any }>()
);


export const cargarTopProductosVentas = createAction(
    VentaActionTypes.CARGAR_TOP_PRODUCTOS_VENTAS,
    props<{ tiendaId: number, fromDate: Date, toDate: Date }>()
);

export const cargarTopProductosVentasExito = createAction(
    VentaActionTypes.CARGAR_TOP_PRODUCTOS_VENTAS_EXITO,
    props<{ topProductoMostSales: ProductsSales[] }>()
);

export const cargarTopProductosVentasError = createAction(
    VentaActionTypes.CARGAR_TOP_PRODUCTOS_VENTAS_ERROR,
    props<{ error: any }>()
);

export const cargarVentasTienda = createAction(
    VentaActionTypes.CARGAR_VENTAS_TIENDA,
    props<{ tiendaId: number, from_date: any, to_date: any, page?: any, page_size?: any }>()
);

export const cargarVentasTiendaExito = createAction(
    VentaActionTypes.CARGAR_VENTAS_TIENDA_EXITO,
    props<{ count: any, next: any, previous: any, index_page: any, length_pages: any, ventas: any, }>()
);

export const cargarVentasTiendaError = createAction(
    VentaActionTypes.CARGAR_VENTAS_TIENDA_ERROR,
    props<{ error: any }>()
);


export const crearVenta = createAction(
    VentaActionTypes.CREAR_VENTA,
    props<{ venta: CreateVenta }>()
);

export const crearVentaExito = createAction(
    VentaActionTypes.CREAR_VENTA_EXITO,
    props<{ venta: Venta }>()
);

export const crearVentaError = createAction(
    VentaActionTypes.CREAR_VENTA_ERROR,
    props<{ error: any }>()
);



export const cancelarVenta = createAction(
    VentaActionTypes.CANCELAR_VENTA,
    props<{ ventaId: number }>()
);

export const cancelarVentaExito = createAction(
    VentaActionTypes.CANCELAR_VENTA_EXITO,
    props<{ ventaId: number }>()
);

export const cancelarVentaError = createAction(
    VentaActionTypes.CANCELAR_VENTA_ERROR,
    props<{ error: any }>()
);



export const cargarResumenVentas = createAction(
    VentaActionTypes.CARGAR_RESUMEN_VENTAS,
    props<{ tiendaId: number }>()
);

export const cargarResumenVentasExito = createAction(
    VentaActionTypes.CARGAR_RESUMEN_VENTAS_EXITO,
    props<{ todaySales: number, thisWeekSales: number, thisMonthSales: number }>()
);

export const cargarResumenVentasError = createAction(
    VentaActionTypes.CARGAR_RESUMEN_VENTAS_ERROR,
    props<{ error: any }>()
);



// Acción para cargar ventas por rango de fechas y tienda
export const cargarVentasRangoFechasTienda = createAction(
    VentaActionTypes.CARGAR_VENTAS_RANGO_FECHAS_TIENDA,
    props<{ tiendaId: number, fromDate: Date, toDate: Date }>()
);

// Acción para el éxito de la carga de ventas por rango de fechas y tienda
export const cargarVentasRangoFechasTiendaExito = createAction(
    VentaActionTypes.CARGAR_VENTAS_RANGO_FECHAS_TIENDA_EXITO,
    props<{ salesDateRangePerDay: Array<[string, number]> }>()
);

// Acción para el error de la carga de ventas por rango de fechas y tienda
export const cargarVentasRangoFechasTiendaError = createAction(
    VentaActionTypes.CARGAR_VENTAS_RANGO_FECHAS_TIENDA_ERROR,
    props<{ error: any }>()
);



export const cargarProductosMenorStock = createAction(
    VentaActionTypes.CARGAR_PRODUCTOS_MENOR_STOCK,
    props<{ tiendaId: number }>()
);

export const cargarProductosMenorStockSuccess = createAction(
    VentaActionTypes.CARGAR_PRODUCTOS_MENOR_STOCK_SUCCESS,
    props<{ lowStockProducts: any[] }>()
);

export const cargarProductosMenorStockFailure = createAction(
    VentaActionTypes.CARGAR_PRODUCTOS_MENOR_STOCK_FAILURE,
    props<{ error: any }>()
);
export const clearVentaTemporal = createAction(
    VentaActionTypes.CLEAR_VENTA_TEMPORAL,

);


export const searchVenta = createAction(
    VentaActionTypes.SEARCH_VENTA,
    props<{ query: Partial<QuerySearchVenta>, tiendaId: any, page_size?: any, page?: any }>()
);

export const searchVentaSuccess = createAction(
    VentaActionTypes.SEARCH_VENTA_SUCCESS,
    props<{ ventas: any, count: any, next: any, previous: any, index_page: any, length_pages: any, search_ventas_found: any }>()
);

export const searchVentaFail = createAction(
    VentaActionTypes.SEARCH_VENTA_FAIL,
    props<{ error: any }>()
);


export const clearVentaSearch = createAction(
    VentaActionTypes.CLEAR_VENTA_SEARCH,

);



