
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { UserState } from '../reducers/user.reducer';




export const selectUsersState = (state: AppState) => state.User;

export const selectUser = createSelector(
    selectUsersState,
    (state: UserState) => state
);



