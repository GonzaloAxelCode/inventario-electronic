import { Observable } from 'rxjs';

export interface AuthState {


    errors?: AuthErrors;
    isLoadingLogin: boolean;
    isLoadingLogout: boolean,
    isAuthenticated?: boolean;
    accessToken?: string;
    refreshToken?: string;
    loadingCheckAuthenticated?: boolean
}

export interface AuthErrors {
    detail?: string;
    new_password?: string[];
    non_field_errors?: string[];
    token?: string[];
    current_password?: string[];
}

export interface Tokens {
    access?: string;
    refresh?: string;
}

export interface UserAuth {
    username?: string;
    password?: string;
}

export interface TokenPair {
    accessToken?: string;
    refreshToken?: string;
}



export interface LoginType {
    email?: string;
    password?: string;
}

export interface AuthEffectsInterface {
    loginInEffect$: Observable<any>;
    checkAuthenticateEffect$: Observable<any>;
    handleResponseLogin(response: any): void;
    handleCatchErrorLogin(error: any): Observable<never>;
    handleCheckAuth(): Observable<any>;
}