import { GuiaRemisionRemitente } from '@/app/models/guia-remision.models';
import { createReducer, on } from '@ngrx/store';
import {
    cargarGuias,
    cargarGuiasExito,
    cargarGuiasError,
    crearGuia,
    crearGuiaExito,
    crearGuiaError,
    anularGuia,
    anularGuiaExito,
    anularGuiaError,
} from '../actions/guia-remision.actions';

export interface GuiaRemisionState {
    guias: GuiaRemisionRemitente[];
    loading: boolean;
    error: any;
    count: number;
    next: any;
    previous: any;
    index_page: any;
    length_pages: any;
    loadingCreate: boolean;
}

export const initialState: GuiaRemisionState = {
    guias: [],
    loading: false,
    error: null,
    count: 0,
    next: null,
    previous: null,
    index_page: null,
    length_pages: null,
    loadingCreate: false,
};

export const guiaRemisionReducer = createReducer(
    initialState,
    on(cargarGuias, (state) => ({
        ...state,
        loading: true,
    })),
    on(cargarGuiasExito, (state, { guias, count, next, previous, index_page, length_pages }) => ({
        ...state,
        guias,
        count,
        next,
        previous,
        index_page,
        length_pages,
        loading: false,
    })),
    on(cargarGuiasError, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),
    on(crearGuia, (state) => ({
        ...state,
        loadingCreate: true,
    })),
    on(crearGuiaExito, (state, { guia }) => ({
        ...state,
        guias: [guia, ...state.guias],
        count: state.count + 1,
        loadingCreate: false,
    })),
    on(crearGuiaError, (state, { error }) => ({
        ...state,
        error,
        loadingCreate: false,
    })),
    on(anularGuia, (state) => ({
        ...state,
        loading: true,
    })),
    on(anularGuiaExito, (state, { guia }) => ({
        ...state,
        guias: state.guias.map(g => g.id === guia.id ? guia : g),
        loading: false,
    })),
    on(anularGuiaError, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),
);
