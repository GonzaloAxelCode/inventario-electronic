import { CategoriaState } from '@/app/models/categoria.models';
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';



export const selectCategoriaState = (state: AppState) => state.Categoria;

export const selectCategoria = createSelector(
    selectCategoriaState,
    (state: CategoriaState) => state
);

