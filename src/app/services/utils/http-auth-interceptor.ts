import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getAuthDataFromLocalStorage } from './localstorage-functions';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler) {
        const { accessToken }: any = getAuthDataFromLocalStorage();

        if (accessToken) {
            const cloned = request.clone({
                withCredentials: true,  // ← AGREGAR ESTO
                setHeaders: {
                    Authorization: `JWT ${accessToken}`
                }
            });
            return next.handle(cloned);
        }

        // También para peticiones sin token (como login)
        const clonedWithoutAuth = request.clone({
            withCredentials: true  // ← AGREGAR ESTO
        });

        return next.handle(clonedWithoutAuth);
    }
}