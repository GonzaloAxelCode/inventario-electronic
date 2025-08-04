import { TokenPair } from "src/app/models/auth.models";

export type AuthDataLocastorage = TokenPair & { idUser: string };

const STORAGE_KEY = "authData";

export function getAuthDataFromLocalStorage(): AuthDataLocastorage {
    if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { accessToken: '', refreshToken: '', idUser: '0' };
    }
    return { accessToken: '', refreshToken: '', idUser: '0' };
}

export function saveAuthDataToLocalStorage(authData: AuthDataLocastorage): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    }
}

export function clearAuthDataFromLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
    }
}


