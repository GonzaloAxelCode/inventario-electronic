import { AuthState } from '@/app/models/auth.models';
import { createAction, props } from '@ngrx/store';

export enum ActionTypes {
    LOGIN_IN_ACTION = 'LOGIN_IN_ACTION',
    LOGIN_IN_SUCCESS = 'LOGIN_IN_SUCCESS',
    LOGIN_IN_FAIL = 'LOGIN_IN_FAIL',
    CHECK_TOKEN_ACTION = 'CHECK_TOKEN_ACTION',
    CHECK_TOKEN_SUCCESS = 'CHECK_TOKEN_SUCCESS',
    CHECK_TOKEN_FAIL = 'CHECK_TOKEN_FAIL',
    CLEAR_TOKENS_ACTION = 'CLEAR_TOKENS_ACTION',
    USER_ME_AUTH = "LOGIN_USER_ME_AUTH",
    USER_ME_AUTH_SUCCESS = "LOGIN_USER_ME_AUTH",
    USER_ME_AUTH_FAIL = "LOGIN_USER_ME_AUTH"
}

export const loginInAction = createAction(
    ActionTypes.LOGIN_IN_ACTION,
    props<{ username: string, password: string }>()
);

export const loginInActionSuccess = createAction(
    ActionTypes.LOGIN_IN_SUCCESS,
    props<AuthState>()
);

export const loginInActionFail = createAction(
    ActionTypes.LOGIN_IN_FAIL,
    props<AuthState>()
);
export const userMeAuthenticated = createAction(
    ActionTypes.USER_ME_AUTH,
);
export const userMeAuthenticatedSuccess = createAction(
    ActionTypes.USER_ME_AUTH_SUCCESS,
    props<{ user_id_auth: number }>()
);
export const userMeAuthenticatedFail = createAction(
    ActionTypes.USER_ME_AUTH_FAIL,
    props<{ errors: any }>()
);

export const checkTokenAction = createAction(ActionTypes.CHECK_TOKEN_ACTION);
export const checkTokenActionFail = createAction(ActionTypes.CHECK_TOKEN_FAIL);

export const checkTokenActionSuccess = createAction(
    ActionTypes.CHECK_TOKEN_SUCCESS
);

export const clearTokensAction = createAction(ActionTypes.CLEAR_TOKENS_ACTION);

