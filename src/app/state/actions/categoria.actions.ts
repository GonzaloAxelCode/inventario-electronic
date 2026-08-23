import { Categoria, CategoriaCreate, CategoriaUpdate, PorcentajeCategoria } from '@/app/models/categoria.models';
import { createAction, props } from '@ngrx/store';

export enum CategoriaActionTypes {
    LOAD_CATEGORIAS = '[Categoria] Load Categorias',
    LOAD_CATEGORIAS_SUCCESS = '[Categoria] Load Categorias Success',
    LOAD_CATEGORIAS_FAIL = '[Categoria] Load Categorias Fail',
    CREATE_CATEGORIA = '[Categoria] Create Categoria',
    CREATE_CATEGORIA_SUCCESS = '[Categoria] Create Categoria Success',
    CREATE_CATEGORIA_FAIL = '[Categoria] Create Categoria Fail',
    UPDATE_CATEGORIA = '[Categoria] Update Categoria',
    UPDATE_CATEGORIA_SUCCESS = '[Categoria] Update Categoria Success',
    UPDATE_CATEGORIA_FAIL = '[Categoria] Update Categoria Fail',
    DELETE_CATEGORIA = '[Categoria] Delete Categoria',
    DELETE_CATEGORIA_SUCCESS = '[Categoria] Delete Categoria Success',
    DELETE_CATEGORIA_FAIL = '[Categoria] Delete Categoria Fail',
    LOAD_PORCENTAJE_CATEGORIA = '[Categoria] Load Porcentaje Categoria',
    LOAD_PORCENTAJE_CATEGORIA_SUCCESS = '[Categoria] Load Porcentaje Categoria Success',
    LOAD_PORCENTAJE_CATEGORIA_FAIL = '[Categoria] Load Porcentaje Categoria Fail',
}

export const loadCategorias = createAction(CategoriaActionTypes.LOAD_CATEGORIAS);
export const loadCategoriasSuccess = createAction(
    CategoriaActionTypes.LOAD_CATEGORIAS_SUCCESS,
    props<{ categorias: Categoria[] }>()
);
export const loadCategoriasFail = createAction(
    CategoriaActionTypes.LOAD_CATEGORIAS_FAIL,
    props<{ error: any }>()
);

export const createCategoriaAction = createAction(
    CategoriaActionTypes.CREATE_CATEGORIA,
    props<{ categoria: CategoriaCreate }>()
);
export const createCategoriaSuccess = createAction(
    CategoriaActionTypes.CREATE_CATEGORIA_SUCCESS,
    props<{ categoria: Categoria }>()
);
export const createCategoriaFail = createAction(
    CategoriaActionTypes.CREATE_CATEGORIA_FAIL,
    props<{ error: any }>()
);

export const updateCategoriaAction = createAction(
    CategoriaActionTypes.UPDATE_CATEGORIA,
    props<{ categoria: CategoriaUpdate }>()
);
export const updateCategoriaSuccess = createAction(
    CategoriaActionTypes.UPDATE_CATEGORIA_SUCCESS,
    props<{ categoria: Categoria }>()
);
export const updateCategoriaFail = createAction(
    CategoriaActionTypes.UPDATE_CATEGORIA_FAIL,
    props<{ error: any }>()
);

export const deleteCategoriaAction = createAction(
    CategoriaActionTypes.DELETE_CATEGORIA,
    props<{ id: number }>()
);
export const deleteCategoriaSuccess = createAction(
    CategoriaActionTypes.DELETE_CATEGORIA_SUCCESS,
    props<any>()
);
export const deleteCategoriaFail = createAction(
    CategoriaActionTypes.DELETE_CATEGORIA_FAIL,
    props<{ error: any }>()
);

export const loadPorcentajeCategoria = createAction(
    CategoriaActionTypes.LOAD_PORCENTAJE_CATEGORIA
);
export const loadPorcentajeCategoriaSuccess = createAction(
    CategoriaActionTypes.LOAD_PORCENTAJE_CATEGORIA_SUCCESS,
    props<{ porcentajes: PorcentajeCategoria[] }>()
);
export const loadPorcentajeCategoriaFail = createAction(
    CategoriaActionTypes.LOAD_PORCENTAJE_CATEGORIA_FAIL,
    props<{ error: any }>()
);