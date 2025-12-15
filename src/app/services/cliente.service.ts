import { Cliente, ClienteCreate, ClienteUpdate } from '@/app/models/cliente.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { getAuthDataFromLocalStorage } from './utils/localstorage-functions';
export interface QuerySearchCliente {
    text: string;

}

@Injectable({
    providedIn: 'root',
})
export class ClienteService {
    private siteURL = `${URL_BASE}/api`;
    private http = inject(HttpClient);

    private getAuthHeaders(): HttpHeaders {
        const { accessToken } = getAuthDataFromLocalStorage();
        return new HttpHeaders().set('Authorization', `JWT ${accessToken}`);
    }

    // 🔹 Obtener todos los clientes de la tienda del usuario autenticado
    fetchClientes(): Observable<{ results: Cliente[] }> {
        const headers = this.getAuthHeaders();
        return this.http.get<any>(`${this.siteURL}/clientes/`, { headers }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }

    // 🔹 Crear nuevo cliente
    createCliente(cliente: ClienteCreate): Observable<Cliente> {
        const headers = this.getAuthHeaders();
        return this.http.post<Cliente>(`${this.siteURL}/clientes/create/`, cliente, { headers }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }

    // 🔹 Obtener cliente por DNI
    fetchClienteByDni(dni: string): Observable<Cliente> {
        const headers = this.getAuthHeaders();
        return this.http.get<Cliente>(`${this.siteURL}/clientes/${dni}/`, { headers }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }

    // 🔹 Actualizar cliente (si tienes endpoint PUT/PATCH)
    updateCliente(cliente: ClienteUpdate): Observable<Cliente> {
        const headers = this.getAuthHeaders();
        // Aquí debes usar el endpoint correcto según tu backend (no está definido en tu código Django actual)
        // Por ejemplo, podrías tener `/clientes/update/<dni>/`
        return this.http.put<Cliente>(`${this.siteURL}/clientes/${cliente.document}/`, cliente, { headers }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }

    // 🔹 Desactivar cliente
    deactivateCliente(dni: string): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.patch(`${this.siteURL}/clientes/deactivate/${dni}/`, {}, { headers }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }

    // 🔹 Eliminar cliente (si tu backend soporta DELETE)
    deleteCliente(dni: string): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.delete(`${this.siteURL}/clientes/${dni}/`, { headers }).pipe(
            catchError(error => {
                console.error(error);
                return throwError(() => error);
            })
        );
    }
}
