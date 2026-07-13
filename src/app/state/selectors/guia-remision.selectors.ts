import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { GuiaRemisionState } from '../reducers/guia-remision.reducer';

export const selectGuiaRemisionState = (state: AppState) => state.GuiaRemision;

export const selectGuiaRemision = createSelector(
    selectGuiaRemisionState,
    (state: GuiaRemisionState) => state
);

export const selectGuias = createSelector(
    selectGuiaRemisionState,
    (state: GuiaRemisionState) => state.guias
);

export const selectGuiasLoading = createSelector(
    selectGuiaRemisionState,
    (state: GuiaRemisionState) => state.loading
);

export const selectGuiasCount = createSelector(
    selectGuiaRemisionState,
    (state: GuiaRemisionState) => state.count
);

export const selectGuiasPagination = createSelector(
    selectGuiaRemisionState,
    (state: GuiaRemisionState) => ({
        index_page: state.index_page,
        length_pages: state.length_pages,
        count: state.count,
    })
);
