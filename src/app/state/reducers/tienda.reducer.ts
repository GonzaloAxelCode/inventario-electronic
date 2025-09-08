import { TiendaState } from '@/app/models/tienda.models';
import { createReducer, on } from '@ngrx/store';
import { createTiendaAction, createTiendaFail, createTiendaSuccess, desactivateTiendaAction, desactivateTiendaFail, desactivateTiendaSuccess, loadTiendasAction, loadTiendasFail, loadTiendasSuccess } from '../actions/tienda.actions';


const initialState: TiendaState = {
    tiendas: [],
    loadingTiendas: false,
    errors: {}
};

export const tiendaReducer = createReducer(
    initialState,
    on(loadTiendasAction, state => ({
        ...state,
        loadingTiendas: true
    })),
    on(loadTiendasSuccess, (state, { tiendas }) => ({
        ...state,
        tiendas: tiendas.filter(t => t.ruc !== "00000000000"),
        loadingTiendas: false
    })),

    on(loadTiendasFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingTiendas: false
    })),
    on(createTiendaAction, state => ({
        ...state,

    })),
    on(createTiendaSuccess, (state, { tienda }) => ({
        ...state,
        tiendas: [...state.tiendas, tienda],

    })),
    on(createTiendaFail, (state, { error }) => ({
        ...state,
        errors: error,

    })),
    on(desactivateTiendaAction, state => ({
        ...state,
    })),
    on(desactivateTiendaSuccess, (state, { id }) => ({
        ...state,
        tiendas: state.tiendas.map(tienda => tienda.id === id ? { ...tienda, activo: !tienda.activo } : tienda)
    })),
    on(desactivateTiendaFail, (state, { error }) => ({
        ...state,
        errors: error,
    })),
);

