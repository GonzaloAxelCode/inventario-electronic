import { Categoria, CategoriaCreate, CategoriaUpdate } from '@/app/models/categoria.models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BASE } from './utils/endpoints';
import { printError } from './utils/print-errors';


@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private siteURL = URL_BASE + "/api"
  private http = inject(HttpClient)


  fetchCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.siteURL}/categorias`).pipe(
      catchError(error => throwError(error))
    );
  }

  createCategoria(categoria: CategoriaCreate): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.siteURL}/categorias/create/`, categoria).pipe(
      catchError(error => {
        printError(error)
        return throwError(error)
      })
    );
  }

  updateCategoria(categoria: CategoriaUpdate): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.siteURL}/categorias/update/${categoria.id}/`, categoria).pipe(
      catchError(error => {
        printError(error)
        return throwError(error)
      })
    );
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.siteURL}/categorias/delete/${id}/`).pipe(
      catchError(error => {
        printError(error)
        return throwError(error)
      })
    );
  }
}

