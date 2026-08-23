import { Categoria, PorcentajeCategoria } from '@/app/models/categoria.models';
import { createReducer, on } from '@ngrx/store';
import { createCategoriaAction, createCategoriaFail, createCategoriaSuccess, deleteCategoriaAction, deleteCategoriaFail, deleteCategoriaSuccess, loadCategorias, loadCategoriasFail, loadCategoriasSuccess, loadPorcentajeCategoria, loadPorcentajeCategoriaFail, loadPorcentajeCategoriaSuccess, updateCategoriaAction, updateCategoriaFail, updateCategoriaSuccess } from '../actions/categoria.actions';



export interface CategoriaState {
  categorias: Categoria[];
  loadingCategorias: boolean;
  errors?: any;
  loadingCreateCategoria: boolean
  loadingDesactivateCategoria: boolean
  loadingUpdateCategoria: boolean
  porcentajes: PorcentajeCategoria[];
  loadingPorcentaje: boolean;
}

export const initialState: CategoriaState = {
  categorias: [],
  loadingCategorias: false,
  loadingCreateCategoria: false,
  loadingDesactivateCategoria: false,
  loadingUpdateCategoria: false,
  errors: {},
  porcentajes: [],
  loadingPorcentaje: false,
};

export const categoriaReducer = createReducer(
  initialState,
  on(loadCategorias, state => ({
    ...state,
    loadingCategorias: true
  })),
  on(loadCategoriasSuccess, (state, { categorias }) => ({
    ...state,
    categorias,
    loadingCategorias: false
  })),
  on(loadCategoriasFail, (state, { error }) => ({
    ...state,
    errors: error,
    loadingCategorias: false
  })),
  on(createCategoriaAction, (state) => ({
    ...state,
    loadingCreateCategoria: true
  })),
  on(createCategoriaSuccess, (state, { categoria }) => ({
    ...state,
    categorias: [...state.categorias, categoria],

    loadingCreateCategoria: false
  })),
  on(createCategoriaFail, (state, { error }) => ({
    ...state,
    errors: error,
    loadingCreateCategoria: false
  })), on(updateCategoriaAction, (state, { categoria }) => ({
    ...state,
    loadingUpdateCategoria: true
  })),
  on(updateCategoriaFail, (state, { error }) => ({
    ...state,
    errors: error,
    loadingUpdateCategoria: false

  })),
  on(updateCategoriaSuccess, (state, { categoria }) => ({
    ...state,
    categorias: state.categorias.map(cat => cat.id === categoria.id ? categoria : cat),
    loadingUpdateCategoria: false
  })),
  on(deleteCategoriaAction, (state) => ({
    ...state,
    loadingDesactivateCategoria: true
  })),
  on(deleteCategoriaFail, (state, { error }) => ({
    ...state,
    errors: error,
    loadingDesactivateCategoria: false
  })),
  on(deleteCategoriaSuccess, (state, { id }) => ({
    ...state,
    categorias: state.categorias.filter(cat => cat.id !== id),
    loadingDesactivateCategoria: false
  })),
  on(loadPorcentajeCategoria, (state) => ({
    ...state,
    loadingPorcentaje: true
  })),
  on(loadPorcentajeCategoriaSuccess, (state, { porcentajes }) => ({
    ...state,
    porcentajes,
    loadingPorcentaje: false
  })),
  on(loadPorcentajeCategoriaFail, (state, { error }) => ({
    ...state,
    errors: error,
    loadingPorcentaje: false
  }))
);
