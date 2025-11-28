import { Cliente } from '@/app/models/cliente.models';
import { ClienteService } from '@/app/services/cliente.service';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
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
    getClienteAction,
    getClienteFail,
    getClienteSuccess,
    loadClientes,
    loadClientesFail,
    loadClientesSuccess,
    updateClienteAction,
    updateClienteFail,
    updateClienteSuccess
} from '../actions/cliente.actions';

@Injectable()
export class ClienteEffects {
    private actions$ = inject(Actions);
    private clienteService = inject(ClienteService);

    // 🔹 Cargar todos los clientes
    loadClientes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadClientes),
            mergeMap(() =>
                this.clienteService.fetchClientes().pipe(
                    map((clientes: Cliente[]) => {

                        return loadClientesSuccess({ clientes })
                    }),
                    catchError(error => of(loadClientesFail({ error })))
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
}
