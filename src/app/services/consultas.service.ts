import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_BASE } from './utils/endpoints';

@Injectable({
    providedIn: 'root'
})
export class ConsultaService {


    private baseUrl = URL_BASE + "/api/consulta-documento/"

    constructor(private http: HttpClient) { }

    consultarDNI(dni: string): Observable<any> {
        const body = {

            numero: dni,
            tipo: "dni"
        };
        return this.http.post<any>(this.baseUrl, body, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    consultarRUC(ruc: string): Observable<any> {
        const body = {
            numero: ruc,
            tipo: "ruc"
        };
        return this.http.post<any>(this.baseUrl, body, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
