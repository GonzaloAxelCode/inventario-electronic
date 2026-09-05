import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { CompraState } from '../reducers/compra.reducer';

export const selectCompraState = (state: AppState) => state.Compra;

export const selectCompra = createSelector(
    selectCompraState,
    (state: CompraState) => state
);

export const selectCompraError = createSelector(
    selectCompraState,
    (state: CompraState) => state.error?.error || {}
);

export const selectCompraLoadingCreate = createSelector(
    selectCompraState,
    (state: CompraState) => state.loadingCreate
);

export const selectCompraFiles = createSelector(
    selectCompraState,
    (state: CompraState) => ({
        files: state.comprobantes_files || [],
        loadingFiles: state.loadingFiles,
    })
);
