
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { VentaState } from '../reducers/venta.reducer';




export const selectVentaState = (state: AppState) => state.Venta;

export const selectVenta = createSelector(
    selectVentaState,
    (state: VentaState) => state
);

export const selectReporteMensual = createSelector(
    selectVentaState,
    (state: VentaState) => state.reporteMensual
);

export const selectLoadingReporteMensual = createSelector(
    selectVentaState,
    (state: VentaState) => state.loadingReporteMensual
);

export const selectMetodosPagoRango = createSelector(
    selectVentaState,
    (state: VentaState) => state.metodosPagoRango
);

export const selectLoadingMetodosPagoRango = createSelector(
    selectVentaState,
    (state: VentaState) => state.loadingMetodosPagoRango
);

export const selectTopProductosMes = createSelector(
    selectVentaState,
    (state: VentaState) => state.topProductosMes
);

export const selectLoadingTopProductosMes = createSelector(
    selectVentaState,
    (state: VentaState) => state.loadingTopProductosMes
);

export const selectTopCategoriasMes = createSelector(
    selectVentaState,
    (state: VentaState) => state.topCategoriasMes
);

export const selectLoadingTopCategoriasMes = createSelector(
    selectVentaState,
    (state: VentaState) => state.loadingTopCategoriasMes
);




