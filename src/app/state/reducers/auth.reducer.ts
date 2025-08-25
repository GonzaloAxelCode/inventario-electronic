import { createReducer, on } from '@ngrx/store';



import { AuthState } from '@/app/models/auth.models';

import { clearAuthDataFromLocalStorage, getAuthDataFromLocalStorage } from '@/app/services/utils/localstorage-functions';
import {
  checkTokenAction,
  checkTokenActionFail,
  checkTokenActionSuccess,
  clearTokensAction,
  loginInAction,
  loginInActionFail,
  loginInActionSuccess,
  userMeAuthenticated,
  userMeAuthenticatedFail,
  userMeAuthenticatedSuccess
} from '../actions/auth.actions';

const { refreshToken, accessToken, } = getAuthDataFromLocalStorage();

export const initialState: AuthState = {
  errors: {},

  isAuthenticated: false,
  accessToken: accessToken || '',
  refreshToken: refreshToken || '',
  isLoadingLogin: false,
  isLoadingLogout: false,
  loadingCheckAuthenticated: false,

};

export const authReducer = createReducer(
  initialState,
  on(loginInAction, (state, payload) => ({
    ...state,
    ...payload,
    isLoadingLogin: true,
  })),

  on(loginInActionSuccess, (state, payload) => ({
    ...state,
    ...payload,
    isLoadingLogin: false,

  })),
  on(loginInActionFail, (state, payload) => ({
    ...state,
    ...payload,
    isLoadingLogin: false,
  })),

  on(userMeAuthenticated, (state, _) => ({
    ...state,

  })),

  on(userMeAuthenticatedSuccess, (state, { user_id_auth }) => ({
    ...state,
    user_id_auth
  })),
  on(userMeAuthenticatedFail, (state, { errors }) => ({
    ...state,
    errors

  })),


  on(checkTokenAction, (state, payload) => ({
    ...state,
    ...payload,
    loadingCheckAuthenticated: true
  })),
  on(checkTokenActionSuccess, (state, payload) => ({
    ...state,
    ...payload,
    isAuthenticated: true,
    loadingCheckAuthenticated: false
  })),
  on(checkTokenActionFail, (state, payload) => ({
    ...state,
    ...payload,
    isAuthenticated: false,
    loadingCheckAuthenticated: false
  })),


  on(clearTokensAction, (state, payload) => {
    clearAuthDataFromLocalStorage();
    return {
      ...state,
      ...payload,
      accessToken: '',
      refreshToken: '',
      isAuthenticated: false,

    };
  })
);

