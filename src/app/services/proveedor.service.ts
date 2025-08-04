import { Proveedor, ProveedorCreate } from '@/app/models/proveedor.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { printError } from './utils/print-errors';

@Injectable({
    providedIn: 'root',
})
export class ProveedorService {
    private siteURL = URL_BASE + "/api";
    private http = inject(HttpClient);

    fetchProveedores(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.siteURL}/proveedores`).pipe(
            catchError(error => throwError(error))
        );
    }

    createProveedor(proveedor: ProveedorCreate): Observable<Proveedor> {
        return this.http.post<Proveedor>(`${this.siteURL}/proveedores/create/`, proveedor).pipe(
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

    deleteProveedor(id: number): Observable<any> {
        return this.http.delete(`${this.siteURL}/proveedores/delete/${id}/`).pipe(
            catchError(error => {
                printError(error);
                return throwError(error);
            })
        );
    }
}
