import { Proveedor, ProveedorCreate } from '@/app/models/proveedor.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TIENDA_ID } from '../constants/tienda-vars';
import { URL_BASE } from './utils/endpoints';
import { printError } from './utils/print-errors';

@Injectable({
    providedIn: 'root',
})
export class ProveedorService {
    private siteURL = URL_BASE + "/api";
    private http = inject(HttpClient);

    fetchProveedores(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.siteURL}/proveedores?tienda=${TIENDA_ID}`).pipe(
            catchError(error => throwError(error))
        );
    }

    createProveedor(proveedor: ProveedorCreate): Observable<Proveedor> {
        return this.http.post<Proveedor>(`${this.siteURL}/proveedores/create/`, { ...proveedor, tienda: TIENDA_ID }).pipe(
            catchError(error => {
                printError(error);
                return throwError(error);
            })
        );
    }

    updateProveedor(proveedor: Proveedor): Observable<Proveedor> {
        return this.http.put<Proveedor>(`${this.siteURL}/proveedores/update/${proveedor.id}/`, proveedor).pipe(
            catchError(error => {
                printError(error);
                return throwError(error);
            })
        );
    }

    activateOrDesactivateProveedor(proveedor: Proveedor, activo: boolean): Observable<any> {
        const url = `${this.siteURL}/proveedores/toggleactivate/${proveedor.id}/`
        return this.http.post(url, { activo }).pipe(
            catchError(error => {
                printError(error);
                return throwError(() => error);
            })
        );
    }

}
