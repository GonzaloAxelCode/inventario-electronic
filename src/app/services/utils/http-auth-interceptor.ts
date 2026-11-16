import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { clearTokensAction } from '@/app/state/actions/auth.actions';
import { clearUserAction } from '@/app/state/actions/user.actions';
import { getAuthDataFromLocalStorage } from './localstorage-functions';

function isAuthEndpoint(url: string): boolean {
    return url.includes('/api/auth/') || url.includes('/auth/jwt/');
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler) {
        const { accessToken }: any = getAuthDataFromLocalStorage();

        if (accessToken) {
            const cloned = request.clone({
                withCredentials: true,
                setHeaders: {
                    Authorization: `JWT ${accessToken}`
                }
            });
            return next.handle(cloned).pipe(
                catchError((error: HttpErrorResponse) => this.handle401(error, request))
            );
        }

        // También para peticiones sin token (como login)
        const clonedWithoutAuth = request.clone({
            withCredentials: true
        });

        return next.handle(clonedWithoutAuth).pipe(
            catchError((error: HttpErrorResponse) => this.handle401(error, request))
        );
    }

    private handle401(error: HttpErrorResponse, request: HttpRequest<any>) {
        if (error.status === 401 && !isAuthEndpoint(request.url)) {
            try {
                const store = this.injector.get(Store);
                store.dispatch(clearTokensAction());
                store.dispatch(clearUserAction());
            } catch {}
            try {
                const router = this.injector.get(Router);
                if (router.url !== '/login') {
                    router.navigate(['/login']).catch(() => window.location.assign('/login'));
                }
            } catch {
                if (window.location.pathname !== '/login') window.location.assign('/login');
            }
        }
        return throwError(() => error);
    }
}