import { User } from '@/app/models/user.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { getAuthDataFromLocalStorage } from './utils/localstorage-functions';


@Injectable({
    providedIn: 'root',
})
export class UserService {
    private siteURL = `${URL_BASE}/api`;
    private http = inject(HttpClient);

    fetchCurrentUser(): Observable<User> {
        const { accessToken } = getAuthDataFromLocalStorage()
        const headers = new HttpHeaders().set('Authorization', `JWT ${accessToken}`);

        return this.http.get<User>(`${this.siteURL}/usuarios/me/`, {
            headers
        }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }
    fetchUsers(idTienda: number): Observable<User[]> {
        const { accessToken } = getAuthDataFromLocalStorage()
        const headers = new HttpHeaders().set('Authorization', `JWT ${accessToken}`);

        return this.http.get<User[]>(`${this.siteURL}/usuarios/tienda/${idTienda}/`, {
            headers
        }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    getDeletedUsers(idTienda: number): Observable<User[]> {
        const { accessToken } = getAuthDataFromLocalStorage()
        const headers = new HttpHeaders().set('Authorization', `JWT ${accessToken}`);

        return this.http.get<User[]>(`${this.siteURL}/usuarios/tienda/${idTienda}/?is_deleted=true`, {
            headers
        }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }
    createUser(user: Partial<User>, tienda_id: number): Observable<User> {
        return this.http.post<User>(`${this.siteURL}/usuarios/create/${tienda_id}/`, user).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }

    updateUser(user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.siteURL}/usuarios/update/${user.id}/`, user).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }


    updateUserPermissions(id: any, permiso: string, valor: boolean): Observable<User> {
        return this.http.put<User>(`${this.siteURL}/usuarios/update/permissions/${id}/`, { permiso, valor }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    desactivateUser(id: number, is_active: boolean): Observable<User> {
        return this.http.put<User>(`${this.siteURL}/usuarios/update/${id}/`, { is_active }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }


    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.siteURL}/usuarios/delete/${id}/`).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    updateUserConfig(config: {
        theme?: 'light' | 'dark';
        navbar_type?: 'top' | 'normal';
        modulos_habilitados?: string[];
    }): Observable<any> {
        const { accessToken } = getAuthDataFromLocalStorage();
        const headers = new HttpHeaders().set('Authorization', `JWT ${accessToken}`);

        return this.http.patch(`${this.siteURL}/usuarios/config/`, config, {
            headers
        }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    toggleUserDeleted(id: number, isDeleted?: boolean): Observable<any> {
        const { accessToken } = getAuthDataFromLocalStorage();
        const headers = new HttpHeaders().set('Authorization', `JWT ${accessToken}`);

        const body = isDeleted !== undefined ? { is_deleted: isDeleted } : {};

        return this.http.patch(`${this.siteURL}/usuarios/toggle-deleted/${id}/`, body, {
            headers
        }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    updateUserBasicData(id: number, data: {
        username?: string;
        first_name?: string;
        last_name?: string;
    }): Observable<any> {
        const { accessToken } = getAuthDataFromLocalStorage();
        const headers = new HttpHeaders().set('Authorization', `JWT ${accessToken}`);

        return this.http.patch(`${this.siteURL}/usuarios/update/basic/${id}/`, data, {
            headers
        }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    adminResetPassword(id: number, newPassword: string): Observable<any> {
        const { accessToken } = getAuthDataFromLocalStorage();
        const headers = new HttpHeaders().set('Authorization', `JWT ${accessToken}`);

        return this.http.post(`${this.siteURL}/usuarios/admin/reset-password/${id}/`, {
            new_password: newPassword
        }, {
            headers
        }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }
}
