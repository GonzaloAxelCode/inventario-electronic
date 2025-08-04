import { Caja, OperacionCaja } from '@/app/models/caja.models';
import { createAction, props } from '@ngrx/store';


export enum CajaActionTypes {
    LOAD_CAJA = '[Caja] Load Caja',
    LOAD_CAJA_SUCCESS = '[Caja] Load Caja Success',
    LOAD_CAJA_FAIL = '[Caja] Load Caja Fail',

    CREATE_CAJA = '[Caja] Create Caja',
    CREATE_CAJA_SUCCESS = '[Caja] Create Caja Success',
    CREATE_CAJA_FAIL = '[Caja] Create Caja Fail',

    REALIZAR_GASTO = "REALIZAR GASTO",
    REALIZAR_GASTO_SUCCESS = "REALIZAR GASTO SUCCESS",
    REALIZAR_GASTO_FAIL = "REALIZAR GASTO FAIL",

    REALIZAR_INGRESO = "REALIZAR_INGRESO",
    REALIZAR_INGRESO_SUCCESS = "REALIZAR_INGRESO SUCCESS",
    REALIZAR_INGRESO_FAIL = "REALIZAR_INGRESO FAIL",

    REALIZAR_PRESTAMO = "REALIZAR_PRESTAMO",
    REALIZAR_PRESTAMO_SUCCESS = "REALIZAR_PRESTAMO SUCCESS",
    REALIZAR_PRESTAMO_FAIL = "REALIZAR_PRESTAMO FAIL",

    REINICIALIZAR_CAJA = "REINICIALIZAR_CAJA",
    REINICIALIZAR_CAJA_SUCCESS = "REINICIALIZAR_CAJA SUCCESS",
    REINICIALIZAR_CAJA_FAIL = "REINICIALIZAR_CAJA FAIL",

    CERRAR_CAJA = "CERRAR_CAJA ",
    CERRAR_CAJA_SUCCESS = "CERRAR_CAJA SUCCESS",
    CERRAR_CAJA_FAIL = "CERRAR_CAJA FAIL",


}

export const loadCaja = createAction(
    CajaActionTypes.LOAD_CAJA,
    props<{ tiendaId: number }>()
);

export const loadCajaSuccess = createAction(
    CajaActionTypes.LOAD_CAJA_SUCCESS,
    props<{ caja: Caja; operaciones: OperacionCaja[]; caja_is_open: boolean }>()
);

export const loadCajaFail = createAction(
    CajaActionTypes.LOAD_CAJA_FAIL,
    props<{ error: any }>()
);
export const createCaja = createAction(
    CajaActionTypes.CREATE_CAJA,
    props<{ saldoInicial: any; tiendaId: number; usuarioId: number }>()
);

export const createCajaSuccess = createAction(
    CajaActionTypes.CREATE_CAJA_SUCCESS,
    props<{ caja: Caja, operaciones: OperacionCaja[]; caja_is_open: boolean }>()
);

export const createCajaFail = createAction(
    CajaActionTypes.CREATE_CAJA_FAIL,
    props<{ error: any }>()
);



export const cerrarCaja = createAction(
    CajaActionTypes.CERRAR_CAJA,
    props<{ userId: any, cajaId: any }>()
);

export const cerrarCajaSuccess = createAction(
    CajaActionTypes.CERRAR_CAJA_SUCCESS,
    props<{ caja_is_open: boolean }>()
);

export const cerrarCajaFail = createAction(
    CajaActionTypes.CERRAR_CAJA_FAIL,
    props<{ error: any }>()
);



export const realizarGasto = createAction(
    CajaActionTypes.REALIZAR_GASTO,
    props<{ userId: any, cajaId: any, monto: any, descripcion: any }>()
);

export const realizarGastoSuccess = createAction(
    CajaActionTypes.REALIZAR_GASTO_SUCCESS,
    props<{ operacion: any, caja: any }>()
);

export const realizarGastoFail = createAction(
    CajaActionTypes.REALIZAR_GASTO_FAIL,
    props<{ error: any }>()
);



export const realizarIngreso = createAction(
    CajaActionTypes.REALIZAR_INGRESO,
    props<{ cajaId: any, userId: any, monto: any, descripcion: any }>()
);

export const realizarIngresoSuccess = createAction(
    CajaActionTypes.REALIZAR_INGRESO_SUCCESS,
    props<{ operacion: any, caja: any }>()
);

export const realizarIngresoFail = createAction(
    CajaActionTypes.REALIZAR_INGRESO_FAIL,
    props<{ error: any }>()
);




export const realizarPrestamo = createAction(
    CajaActionTypes.REALIZAR_PRESTAMO,
    props<{ userId: any, tiendaId: any, monto: any, descripcion: any }>()
);

export const realizarPrestamoSuccess = createAction(
    CajaActionTypes.REALIZAR_PRESTAMO_SUCCESS,
    props<{ operacion: any, caja: any }>()
);

export const realizarPrestamoFail = createAction(
    CajaActionTypes.REALIZAR_PRESTAMO_FAIL,
    props<{ error: any }>()
);




export const reinicializarCaja = createAction(
    CajaActionTypes.REINICIALIZAR_CAJA,
    props<{ tiendaId: any, userId: any, cajaId: any, saldoInicial: any }>()
);

export const reinicializarCajaSuccess = createAction(
    CajaActionTypes.REINICIALIZAR_CAJA_SUCCESS,
    props<{ caja_is_open: any, operaciones: any, caja: any }>()
);

export const reinicializarCajaFail = createAction(
    CajaActionTypes.REINICIALIZAR_CAJA_FAIL,
    props<{ error: any }>()
);



