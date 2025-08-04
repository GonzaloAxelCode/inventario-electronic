import { Caja, OperacionCaja } from '@/app/models/caja.models';
import { createReducer, on } from '@ngrx/store';
import {
  cerrarCaja,
  cerrarCajaFail,
  cerrarCajaSuccess,
  createCaja,
  createCajaFail,
  createCajaSuccess,
  loadCaja,
  loadCajaFail,
  loadCajaSuccess,
  realizarGasto,
  realizarGastoFail,
  realizarGastoSuccess,
  realizarIngreso,
  realizarIngresoFail,
  realizarIngresoSuccess,
  realizarPrestamo,
  realizarPrestamoFail,
  realizarPrestamoSuccess,
  reinicializarCaja,
  reinicializarCajaFail,
  reinicializarCajaSuccess,
} from '../actions/caja.actions';

export interface CajaState {
  errors?: any;
  caja_is_open: boolean;
  caja: Caja;
  loadingDataCaja: boolean;
  loadingCreateCaja: boolean;
  operaciones: OperacionCaja[];
  loadingRealizarPrestamo: boolean,
  loadingRealizarGasto: boolean,
  loadingReinicializarCaja: boolean,
  loadingRealizarIngreso: boolean,
  loadingCerrarCaja: boolean,
}

export const initialState: CajaState = {
  caja_is_open: false,
  loadingDataCaja: false,
  loadingCreateCaja: false,
  loadingRealizarPrestamo: false,
  loadingRealizarGasto: false,
  loadingReinicializarCaja: false,
  loadingRealizarIngreso: false,
  loadingCerrarCaja: false,
  caja: {} as Caja,
  errors: {},
  operaciones: [] as OperacionCaja[],
};

export const cajaReducer = createReducer(
  initialState,

  // 🔄 Load Caja
  on(loadCaja, (state) => ({
    ...state,
    loadingDataCaja: true,

  })),

  on(loadCajaSuccess, (state, { caja, operaciones, caja_is_open }) => ({
    ...state,
    loadingDataCaja: false,
    caja,
    caja_is_open,
    operaciones,

  })),

  on(loadCajaFail, (state, { error }) => ({
    ...state,
    loadingDataCaja: false,
    errors: error,
  })),

  // 🆕 Create Caja
  on(createCaja, (state) => ({
    ...state,
    loadingCreateCaja: true,
    errors: {},
  })),

  on(createCajaSuccess, (state, { caja, operaciones, caja_is_open }) => ({
    ...state,
    loadingCreateCaja: false,
    caja,
    caja_is_open,
    operaciones,

  })),

  on(createCajaFail, (state, { error }) => ({
    ...state,
    loadingCreateCaja: false,
    errors: error,
  })),

  // Cerrar Caja
  on(cerrarCaja, (state) => ({
    ...state,
    loadingCerrarCaja: true,
  })),
  on(cerrarCajaSuccess, (state, { caja_is_open }) => ({
    ...state,
    loadingCerrarCaja: false,
    caja: {} as Caja, operaciones: [],
    caja_is_open,
  })),
  on(cerrarCajaFail, (state, { error }) => ({
    ...state,
    loadingCerrarCaja: false,
    errors: error,
  })),

  // Realizar Gasto
  on(realizarGasto, (state) => ({
    ...state,
    loadingRealizarGasto: true,
  })),
  on(realizarGastoSuccess, (state, { operacion, caja }) => ({
    ...state,
    loadingRealizarGasto: false,
    caja,
    operaciones: [...state.operaciones, operacion], // Añadir operación a la lista
  })),
  on(realizarGastoFail, (state, { error }) => ({
    ...state,
    loadingRealizarGasto: false,
    errors: error,
  })),

  // Realizar Ingreso
  on(realizarIngreso, (state) => ({
    ...state,
    loadingRealizarIngreso: true,
  })),
  on(realizarIngresoSuccess, (state, { operacion, caja }) => ({
    ...state,
    loadingRealizarIngreso: false,
    caja,
    operaciones: [...state.operaciones, operacion], // Añadir operación a la lista
  })),
  on(realizarIngresoFail, (state, { error }) => ({
    ...state,
    loadingRealizarIngreso: false,
    errors: error,
  })),

  // Realizar Prestamo
  on(realizarPrestamo, (state) => ({
    ...state,
    loadingRealizarPrestamo: true,
  })),
  on(realizarPrestamoSuccess, (state, { operacion, caja }) => ({
    ...state,
    loadingRealizarPrestamo: false,
    caja,
    operaciones: [...state.operaciones, operacion], // Añadir operación a la lista
  })),
  on(realizarPrestamoFail, (state, { error }) => ({
    ...state,
    loadingRealizarPrestamo: false,
    errors: error,
  })),

  // Reinicializar Caja
  on(reinicializarCaja, (state) => ({
    ...state,
    loadingReinicializarCaja: true,
  })),
  on(reinicializarCajaSuccess, (state, { caja_is_open, operaciones, caja }) => ({
    ...state,
    loadingReinicializarCaja: false,
    caja_is_open,
    caja,
    operaciones,
  })),
  on(reinicializarCajaFail, (state, { error }) => ({
    ...state,
    loadingReinicializarCaja: false,
    errors: error,
  }))
);
