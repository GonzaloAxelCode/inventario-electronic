import { Tokens, UserAuth } from '@/app/models/auth.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { getAuthDataFromLocalStorage } from './utils/localstorage-functions';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private siteURL = URL_BASE
  private http = inject(HttpClient)


  fetchCreateToken(userAuth: UserAuth): Observable<any> {
    return this.http.post<Tokens>(`${this.siteURL}/api/auth/jwt/create/custom/`, userAuth).pipe(
      catchError(error => throwError(error))
    );
  }
  fetchUserMeAuthenticated(): Observable<any> {
    return this.http.get<Tokens>(`${this.siteURL}/auth/users/me/`,).pipe(
      catchError(error => throwError(error))
    );
  }
  fetchCheckAuthenticated(): Observable<any> {
    const { accessToken }: any = getAuthDataFromLocalStorage();
    return this.http.post<Tokens>(`${this.siteURL}/auth/jwt/verify/`, { token: accessToken }).pipe(
      catchError(error => throwError(error))
    );
  }
}
