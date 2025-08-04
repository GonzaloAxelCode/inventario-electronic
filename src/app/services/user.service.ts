import { User, UserPermissions } from '@/app/models/user.models';
import { HttpClient } from '@angular/common/http';
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


    fetchUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.siteURL}/usuarios/`).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }
    fetchCurrentUser(): Observable<User> {
        const { idUser } = getAuthDataFromLocalStorage()
        return this.http.get<User>(`${this.siteURL}/usuarios/${idUser}/`).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
            })
        );
    }

    createUser(user: Partial<User>): Observable<User> {
        return this.http.post<User>(`${this.siteURL}/usuarios/create/`, user).pipe(
            catchError(error => {
                console.error(error);
                return throwError(error);
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


    updateUserPermissions(id: any, permissions: Partial<UserPermissions>): Observable<User> {
        return this.http.put<User>(`${this.siteURL}/usuarios/update/permissions/${id}/`, { permissions }).pipe(
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
}
