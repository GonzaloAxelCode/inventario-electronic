
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { CategoriaState } from '../reducers/categoria.reducer';



export const selectCategoriaState = (state: AppState) => state.Categoria;

export const selectCategoria = createSelector(
    selectCategoriaState,
    (state: CategoriaState) => state
);

