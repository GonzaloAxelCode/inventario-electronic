import { TokenPair } from "src/app/models/auth.models";

export type AuthDataLocastorage = TokenPair

const STORAGE_KEY = "authData";
const USER_DATA_KEY = "userData";

export function getAuthDataFromLocalStorage(): AuthDataLocastorage {
    if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { accessToken: '', refreshToken: '' };
    }
    return { accessToken: '', refreshToken: '' };
}

export function saveAuthDataToLocalStorage(authData: AuthDataLocastorage): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    }
}

export function clearAuthDataFromLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_DATA_KEY);
    }
}

export interface LoginUserData {
    rol?: string;
    tienda?: any;
    mis_tiendas_count?: number;
}

export function saveLoginUserDataToLocalStorage(data: LoginUserData): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    }
}

export function getLoginUserDataFromLocalStorage(): LoginUserData {
    if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(USER_DATA_KEY);
        return data ? JSON.parse(data) : {};
    }
    return {};
}

export function clearLoginUserDataFromLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(USER_DATA_KEY);
    }
}
