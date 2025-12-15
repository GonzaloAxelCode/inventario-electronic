import { Cliente } from '@/app/models/cliente.models';
import { ClienteCacheService } from '@/app/services/cliente-cache.service';
import { ClienteService } from '@/app/services/cliente.service';
import { ClienteSearchService } from '@/app/services/search-services/cliente-search.service';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, from, map, mergeMap, of, switchMap, tap } from 'rxjs';
import {
    createClienteAction,
    createClienteFail,
    createClienteSuccess,
    deactivateClienteAction,
    deactivateClienteFail,
    deactivateClienteSuccess,
    deleteClienteAction,
    deleteClienteFail,
    deleteClienteSuccess,
    forceSyncClientes,
    getClienteAction,
    getClienteFail,
    getClienteSuccess,
    loadClientes,
    loadClientesFail,
    loadClientesSuccess,
    searchClientes,
    searchClientesSuccess,
    updateClienteAction,
    updateClienteFail,
    updateClienteSuccess
} from '../actions/cliente.actions';

@Injectable()
export class ClienteEffects {
    private actions$ = inject(Actions);
    private clienteService = inject(ClienteService);
    private clienteSearchService = inject(ClienteSearchService);
    private cache: ClienteCacheService = inject(ClienteCacheService);

    // 🔹 Cargar todos los clientes
    loadClientesSync$ = createEffect(() =>
        this.actions$.pipe(
            ofType(forceSyncClientes),
            switchMap(() =>
                this.clienteService.fetchClientes().pipe(

                    tap(res => {
                        // side effects (cache)
                        this.cache.saveAll(res.results);
                        this.cache.setLastSync(new Date().toISOString());
                    }),

                    map(res =>
                        loadClientesSuccess({ clientes: res.results })
                    ),

                    catchError(error =>
                        of(loadClientesFail({ error }))
                    )
                )
            )
        )
    );

    loadClientesFromCache$ = createEffect(() =>
        this.actions$.pipe(
            ofType(forceSyncClientes),
            mergeMap(({ }) =>
                this.clienteService.fetchClientes().pipe(
                    tap(async (res) => {
                        await this.cache.saveAll(res.results);
                        await this.cache.setLastSync(new Date().toISOString());
                    }),
                    map(res =>
                        loadClientesSuccess({ clientes: res.results })
                    ),
                    catchError(error => of(loadClientesFail({ error })))
                )
            )
        )
    );
    loadClientesEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadClientes),
            exhaustMap(() =>
                from(this.cache.getAll()).pipe(
                    exhaustMap((cached) => {
                        // 🟢 SI HAY CACHE → NO FETCH
                        if (cached.length > 0) {
                            return of(loadClientesSuccess({ clientes: cached }));
                        }

                        // 🔴 SI NO HAY CACHE → FETCH
                        return this.clienteService.fetchClientes().pipe(
                            tap(async (res) => {
                                await this.cache.saveAll(res.results);
                                await this.cache.setLastSync(new Date().toISOString());
                            }),
                            map(res =>
                                loadClientesSuccess({ clientes: res.results })
                            ),
                            catchError(error => of(loadClientesFail({ error })))
                        );
                    })
                )
            )
        )
    );

    // 🔹 Crear cliente
    createCliente$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createClienteAction),
            mergeMap(({ cliente }) =>
                this.clienteService.createCliente(cliente).pipe(
                    map((newCliente: Cliente) => createClienteSuccess({ cliente: newCliente })),
                    catchError(error => of(createClienteFail({ error })))
                )
            )
        )
    );

    // 🔹 Actualizar cliente
    updateCliente$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateClienteAction),
            mergeMap(({ cliente }) =>
                this.clienteService.updateCliente(cliente).pipe(
                    map((updatedCliente: Cliente) => updateClienteSuccess({ cliente: updatedCliente })),
                    catchError(error => of(updateClienteFail({ error })))
                )
            )
        )
    );

    // 🔹 Obtener cliente por DNI
    getCliente$ = createEffect(() =>
        this.actions$.pipe(
            ofType(getClienteAction),
            switchMap(({ dni }) =>
                this.clienteService.fetchClienteByDni(dni).pipe(
                    map((cliente: Cliente) => getClienteSuccess({ cliente })),
                    catchError(error => of(getClienteFail({ error })))
                )
            )
        )
    );

    // 🔹 Desactivar cliente
    deactivateCliente$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deactivateClienteAction),
            mergeMap(({ dni }) =>
                this.clienteService.deactivateCliente(dni).pipe(
                    map((response: any) =>
                        deactivateClienteSuccess({ message: response.message || 'Cliente desactivado correctamente' })
                    ),
                    catchError(error => of(deactivateClienteFail({ error })))
                )
            )
        )
    );

    // 🔹 Eliminar cliente (si lo implementas)
    deleteCliente$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteClienteAction),
            mergeMap(({ id }) =>
                this.clienteService.deleteCliente(String(id)).pipe(
                    map(() => deleteClienteSuccess({ id })),
                    catchError(error => of(deleteClienteFail({ error })))
                )
            )
        )
    );



    searchClientesEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(searchClientes),
            map(action => {

                const resultados = this.clienteSearchService.filtrarClientes(action.clientes, action.query);


                return searchClientesSuccess({
                    clientes_search: resultados.data,
                    search_found: resultados.found
                });
            })
        )
    );

}
