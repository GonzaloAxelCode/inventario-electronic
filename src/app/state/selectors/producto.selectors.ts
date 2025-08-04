import { ProductoState } from '@/app/models/producto.models';
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';




export const selectProductoState = (state: AppState) => state.Producto;

export const selectProducto = createSelector(
    selectProductoState,
    (state: ProductoState) => state
);



