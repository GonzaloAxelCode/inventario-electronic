import { Venta } from '@/app/models/venta.models';
import { createReducer, on } from '@ngrx/store';
import {
    anularVenta,
    anularVentaError,
    anularVentaExito,
    cancelarVenta,
    cancelarVentaError,
    cancelarVentaExito,
    cargarMetodosPagoRango,
    cargarMetodosPagoRangoExito,
    cargarMetodosPagoRangoError,
    cargarReporteMensual,
    cargarReporteMensualExito,
    cargarReporteMensualError,
    cargarResumenVentas,
    cargarResumenVentasByDate,
    cargarResumenVentasByDateError,
    cargarResumenVentasByDateExito,
    cargarResumenVentasError,
    cargarResumenVentasExito,

    cargarTopProductosVentasHoy,

    cargarTopProductosVentasHoyError,

    cargarTopProductosVentasHoyExito,

    cargarTopProductosMes,
    cargarTopProductosMesExito,
    cargarTopProductosMesError,

    cargarTopCategoriasMes,
    cargarTopCategoriasMesExito,
    cargarTopCategoriasMesError,

    cargarVentasRangoFechasTienda,
    cargarVentasRangoFechasTiendaError,
    cargarVentasRangoFechasTiendaExito,
    cargarVentasTienda,
    cargarVentasTiendaError,
    cargarVentasTiendaErrorToday,
    cargarVentasTiendaExito,
    cargarVentasTiendaExitoToday,
    cargarVentasTiendaToday,
    clearVentaSearch,
    clearVentaTemporal,
    crearVenta,
    crearVentaError,
    crearVentaExito,
    generarComprobanteVenta,
    generarComprobanteVentaError,
    generarComprobanteVentaExito,
    searchVenta,
    searchVentaFail,
    searchVentaSuccess
} from '../actions/venta.actions';
export interface ProductsSales {
    producto_id: number;
    nombre: string;
    cantidad_total_vendida: number;
    producto_imagen?: string
    producto_nombre?: string
    cantidad: number
    precio_unitario: number
}
export interface VentaState {
    ventas: Venta[];
    ventasToday: Venta[]
    loading: boolean;
    error?: any;
    salesDateRangePerDay: Array<[string, number]>;
    todaySales: number,
    thisWeekSales: number,
    thisMonthSales: number,
    topProductoMostSales: ProductsSales[],
    loadingCreateVenta: boolean
    showVentaDetailTemporary: boolean
    temporaryVenta: Venta

    // Reporte mensual
    reporteMensual: {
        total_ventas: number;
        total_ventas_mes_anterior: number;
        porcentaje_vs_mes_anterior: number;
        num_comprobantes: number;
        clientes_atendidos: number;
    };
    loadingReporteMensual: boolean;

    // Métodos de pago por rango
    metodosPagoRango: {
        total_general: number;
        total_ventas: number;
        metodos_pago: { metodo_pago: string; num_ventas: number; total_soles: number; porcentaje: number }[];
    };
    loadingMetodosPagoRango: boolean;

    // Top productos del mes
    topProductosMes: {
        total_productos: number;
        productos: { producto_id: number; nombre: string; sku: string; total_unidades: number; total_ingresos: number }[];
    };
    loadingTopProductosMes: boolean;

    // Top categorías del mes
    topCategoriasMes: {
        total_categorias: number;
        categorias: { categoria_id: number; nombre: string; codigo: string; total_unidades: number; total_ingresos: number }[];
    };
    loadingTopCategoriasMes: boolean;

    search_ventas_found: string;
    count: number;
    next: any;
    previous: any;
    index_page: any;
    length_pages: any;
    loadingSearch: boolean;
    loadingLoadVentas: boolean
    ventas_search: Venta[];
    loadingResumenVentas: boolean
    loadingMostSales: boolean
    loadingNotaCredito: boolean
    loadingGenerarComprobante: boolean
    loadingVentasToday: boolean
}

export const initialState: VentaState = {
    ventas: [],
    ventasToday: [],
    loading: false,
    loadingLoadVentas: false,
    error: null,
    temporaryVenta: {} as Venta,
    showVentaDetailTemporary: false,
    loadingCreateVenta: false,
    todaySales: 0,
    thisWeekSales: 0,
    thisMonthSales: 1212,
    salesDateRangePerDay: [],
    topProductoMostSales: [],
    loadingMostSales: false,
    loadingResumenVentas: false,
    loadingNotaCredito: false,
    loadingGenerarComprobante: false,
    search_ventas_found: "",  // Inicializa como string vacío si es que no hay un valor predeterminado
    count: 0,
    next: null,
    previous: null,
    index_page: null,
    length_pages: null,
    loadingSearch: false,
    ventas_search: [],
    loadingVentasToday: false,
    reporteMensual: {
        total_ventas: 0,
        total_ventas_mes_anterior: 0,
        porcentaje_vs_mes_anterior: 0,
        num_comprobantes: 0,
        clientes_atendidos: 0
    },
    loadingReporteMensual: false,
    metodosPagoRango: {
        total_general: 0,
        total_ventas: 0,
        metodos_pago: []
    },
    loadingMetodosPagoRango: false,
    topProductosMes: {
        total_productos: 0,
        productos: []
    },
    loadingTopProductosMes: false,
    topCategoriasMes: {
        total_categorias: 0,
        categorias: []
    },
    loadingTopCategoriasMes: false
};

export const ventaReducer = createReducer(
    initialState,
    on(cargarVentasRangoFechasTienda, state => ({
        ...state,

    })),
    on(cargarVentasRangoFechasTiendaExito, (state, { salesDateRangePerDay }) => ({
        ...state,
        salesDateRangePerDay,

    })),
    on(cargarVentasRangoFechasTiendaError, (state, { error }) => ({
        ...state,
        error,

    })),

    on(cargarVentasTienda, state => ({
        ...state,
        loadingLoadVentas: true
    })),
    on(cargarVentasTiendaExito, (state, { ventas, count, next, previous, index_page, length_pages }) => ({
        ...state,
        ventas,
        count, next, previous, index_page, length_pages,
        loadingLoadVentas: false
    })),
    on(cargarVentasTiendaError, (state, { error }) => ({
        ...state,
        error,
        loadingLoadVentas: false
    })),

    //Ventas hoy

    on(cargarVentasTiendaToday, state => ({
        ...state,
        loadingVentasToday: true
    })),
    on(cargarVentasTiendaExitoToday, (state, { ventasToday }) => ({
        ...state,

        loadingVentasToday: false,
        ventasToday
    })),
    on(cargarVentasTiendaErrorToday, (state, { error }) => ({
        ...state,
        error,
        loadingVentasToday: false
    })),





    on(crearVenta, state => ({
        ...state,
        loadingCreateVenta: true
    })),
    on(crearVentaExito, (state, { venta }) => ({
        ...state,
        ventas: [...state.ventas, venta],

        temporaryVenta: venta,
        showVentaDetailTemporary: true,
        loadingCreateVenta: false
    })),
    on(crearVentaError, (state, { error }) => ({
        ...state,
        error,
        loadingCreateVenta: false
    })),
    on(generarComprobanteVenta, state => ({
        ...state,
        loadingGenerarComprobante: true
    })),
    on(generarComprobanteVentaExito, (state, { venta }) => ({
        ...state,
        ventas: state.ventas.map(v => v.id === venta.id ? venta : v),
        ventas_search: state.ventas_search.map(v => v.id === venta.id ? venta : v),
        temporaryVenta: venta,
        showVentaDetailTemporary: true,
        loadingGenerarComprobante: false
    })),
    on(generarComprobanteVentaError, (state, { error }) => ({
        ...state,
        error,
        loadingGenerarComprobante: false
    })),
    on(cancelarVenta, state => ({
        ...state,
        loading: true
    })),
    on(cancelarVentaExito, (state, { ventaId }) => ({
        ...state,
        ventas: state.ventas.map(venta =>
            venta.id === ventaId ? { ...venta, estado: 'Cancelada' } : venta
        ),
        loading: false
    })),
    on(cancelarVentaError, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),
    on(cancelarVentaError, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),
    on(cargarResumenVentas, (state) => ({
        ...state,
        loadingResumenVentas: true,
        error: null
    })),

    on(cargarResumenVentasExito, (state, { todaySales, thisWeekSales, thisMonthSales }) => {



        return {
            ...state,
            todaySales: todaySales,
            thisWeekSales: thisWeekSales,
            thisMonthSales: thisMonthSales,
            loadingResumenVentas: false
        };
    }),
    on(cargarResumenVentasError, (state, { error }) => ({
        ...state,
        error,
        loadingResumenVentas: false
    })),
    on(cargarTopProductosVentasHoy, (state) => ({
        ...state,
        loadingMostSales: true,
        error: null
    })),

    on(cargarTopProductosVentasHoyExito, (state, { topProductoMostSales }) => ({
        ...state,
        loadingMostSales: false,
        topProductoMostSales
    })),

    on(cargarTopProductosVentasHoyError, (state, { error }) => ({
        ...state,
        loadingMostSales: false,
        error
    })),
    on(cargarResumenVentasByDate, state => ({
        ...state,
        loading: true
    })),
    on(cargarResumenVentasByDateExito, (state, { todaySales, thisMonthSales, tipo }) => {
        let updatedState = { ...state, loading: false };

        if (tipo === 'day_month_year') {
            updatedState = { ...updatedState, todaySales: todaySales ?? state.todaySales };
        } else if (tipo === 'month_year') {
            updatedState = { ...updatedState, thisMonthSales: thisMonthSales ?? state.thisMonthSales };
        }

        return updatedState;
    }),
    on(cargarResumenVentasByDateError, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),
    on(clearVentaTemporal, (state) => ({
        ...state,

        showVentaDetailTemporary: false,
        temporaryVenta: {} as Venta
    })),
    //search
    on(searchVenta, state => ({
        ...state,
        loadingSearch: true
    })),
    on(searchVentaSuccess, (state, { ventas, search_ventas_found, count, next, previous, index_page, length_pages }) => ({
        ...state,
        ventas_search: ventas,
        loadingSearch: false,
        search_ventas_found: search_ventas_found,
        count: count,
        next, previous, index_page, length_pages
    })),
    on(searchVentaFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingSearch: false
    })),
    on(clearVentaSearch, (state) => ({
        ...state,
        count: 0,
        loadingSearch: false,
        ventas_search: [],
        search_ventas_found: ""
    })),
    on(anularVenta, (state) => ({
        ...state,
        loadingNotaCredito: true,
        errors: null
    })),
    on(anularVentaExito, (state, { ventaId, comprobante_nota_credito }) => ({
        ...state,
        loadingNotaCredito: false,
        errors: null,

        ventas: state.ventas.map(venta =>
            venta.id === ventaId
                ? {
                    ...venta,
                    estado: 'ANULADA',
                    comprobante_nota_credito: comprobante_nota_credito
                }
                : venta
        ),
        ventas_search: state.ventas_search.map(venta =>
            venta.id === ventaId
                ? {
                    ...venta,
                    estado: 'ANULADA',
                    comprobante_nota_credito: comprobante_nota_credito
                }
                : venta
        ),
        ventasToday: state.ventasToday.map(venta =>
            venta.id === ventaId
                ? {
                    ...venta,
                    estado: 'ANULADA',
                    comprobante_nota_credito: comprobante_nota_credito
                }
                : venta
        )
    })),


    on(anularVentaError, (state, { error }) => ({
        ...state,
        loadingNotaCredito: false,
        errors: error
    })),

    // Reporte mensual
    on(cargarReporteMensual, (state) => ({
        ...state,
        loadingReporteMensual: true,
        error: null
    })),
    on(cargarReporteMensualExito, (state, { total_ventas, total_ventas_mes_anterior, porcentaje_vs_mes_anterior, num_comprobantes, clientes_atendidos }) => ({
        ...state,
        loadingReporteMensual: false,
        reporteMensual: {
            total_ventas,
            total_ventas_mes_anterior,
            porcentaje_vs_mes_anterior,
            num_comprobantes,
            clientes_atendidos
        }
    })),
    on(cargarReporteMensualError, (state, { error }) => ({
        ...state,
        loadingReporteMensual: false,
        error
    })),

    // Métodos de pago por rango
    on(cargarMetodosPagoRango, (state) => ({
        ...state,
        loadingMetodosPagoRango: true,
        error: null
    })),
    on(cargarMetodosPagoRangoExito, (state, { total_general, total_ventas, metodos_pago }) => ({
        ...state,
        loadingMetodosPagoRango: false,
        metodosPagoRango: {
            total_general,
            total_ventas,
            metodos_pago
        }
    })),
    on(cargarMetodosPagoRangoError, (state, { error }) => ({
        ...state,
        loadingMetodosPagoRango: false,
        error
    })),

    // Top productos del mes
    on(cargarTopProductosMes, (state) => ({
        ...state,
        loadingTopProductosMes: true,
        error: null
    })),
    on(cargarTopProductosMesExito, (state, { total_productos, productos }) => ({
        ...state,
        loadingTopProductosMes: false,
        topProductosMes: {
            total_productos,
            productos
        }
    })),
    on(cargarTopProductosMesError, (state, { error }) => ({
        ...state,
        loadingTopProductosMes: false,
        error
    })),

    // Top categorías del mes
    on(cargarTopCategoriasMes, (state) => ({
        ...state,
        loadingTopCategoriasMes: true,
        error: null
    })),
    on(cargarTopCategoriasMesExito, (state, { total_categorias, categorias }) => ({
        ...state,
        loadingTopCategoriasMes: false,
        topCategoriasMes: {
            total_categorias,
            categorias
        }
    })),
    on(cargarTopCategoriasMesError, (state, { error }) => ({
        ...state,
        loadingTopCategoriasMes: false,
        error
    }))
);