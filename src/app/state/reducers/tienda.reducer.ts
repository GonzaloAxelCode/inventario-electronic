import { TiendaState } from '@/app/models/tienda.models';
import { createReducer, on } from '@ngrx/store';
import {
    createTiendaAction,
    createTiendaFail,
    createTiendaSuccess,
    desactivateTiendaAction,
    desactivateTiendaFail,
    desactivateTiendaSuccess,
    loadTiendasAction,
    loadTiendasFail,
    loadTiendasSuccess
} from '../actions/tienda.actions';

const initialState: TiendaState = {
    tiendas: [],
    loadingTiendas: false,
    loadingCreateTienda: false,
    loadingActiveTienda: false,
    errors: {}
};

export const tiendaReducer = createReducer(
    initialState,

    // 🔹 Cargar tiendas
    on(loadTiendasAction, (state) => ({
        ...state,
        loadingTiendas: true
    })),
    on(loadTiendasSuccess, (state, { tiendas }) => ({
        ...state,
        tiendas: tiendas.filter((t) => t.ruc !== '00000000000'),
        loadingTiendas: false
    })),
    on(loadTiendasFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingTiendas: false
    })),

    // 🔹 Crear tienda
    on(createTiendaAction, (state) => ({
        ...state,
        loadingCreateTienda: true
    })),
    on(createTiendaSuccess, (state, { tienda }) => ({
        ...state,
        tiendas: [...state.tiendas, tienda],
        loadingCreateTienda: false
    })),
    on(createTiendaFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingCreateTienda: false
    })),

    // 🔹 Activar / desactivar tienda
    on(desactivateTiendaAction, (state) => ({
        ...state,
        loadingActiveTienda: true
    })),
    on(desactivateTiendaSuccess, (state, { id }) => ({
        ...state,
        tiendas: state.tiendas.map((tienda) =>
            tienda.id === id ? { ...tienda, activo: !tienda.activo } : tienda
        ),
        loadingActiveTienda: false
    })),
    on(desactivateTiendaFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingActiveTienda: false
    }))
);
