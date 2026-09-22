import { Categoria, CategoriaCreate, CategoriaUpdate, PorcentajeCategoriaResponse } from '@/app/models/categoria.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';


@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private siteURL = URL_BASE + "/api"
  private http = inject(HttpClient)


  fetchCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.siteURL}/categorias/`).pipe(
      catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
    );
  }

  createCategoria(categoria: CategoriaCreate): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.siteURL}/categorias/create/`, { ...categoria }).pipe(
      catchError(error => {
        console.error(error)
        return throwError(error)
      })
    );
  }

  updateCategoria(categoria: CategoriaUpdate): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.siteURL}/categorias/update/${categoria.id}/`, categoria).pipe(
      catchError(error => {
        console.error(error)
        return throwError(error)
      })
    );
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.siteURL}/categorias/delete/${id}/`).pipe(
      catchError(error => {
        console.error(error)
        return throwError(error)
      })
    );
  }

  fetchPorcentajePorCategoria(): Observable<PorcentajeCategoriaResponse> {
    return this.http.get<PorcentajeCategoriaResponse>(`${this.siteURL}/inventarios/porcentaje-por-categoria/`).pipe(
      catchError((error) => {
                console.error(error);
                return throwError(() => error);
            })
    );
  }
}

