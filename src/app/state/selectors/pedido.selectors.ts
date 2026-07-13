import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PedidoState } from '../reducers/pedido.reducer';

export const selectPedidoState = createFeatureSelector<PedidoState>('Pedido');

export const selectPedido = createSelector(
    selectPedidoState,
    (state: PedidoState) => state
);
