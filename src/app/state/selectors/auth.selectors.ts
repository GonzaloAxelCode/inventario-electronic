import { AuthState } from '@/app/models/auth.models';
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';



export const selectAuthState = (state: AppState) => state.Auth;

export const selectAuth = createSelector(
    selectAuthState,
    (state: AuthState) => state
);

