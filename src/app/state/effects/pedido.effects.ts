import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';

import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { PedidoService } from '@/app/services/pedido.service';
import {
    cargarPedidos,
    cargarPedidosExito,
    cargarPedidosError,
    buscarPedidos,
    buscarPedidosExito,
    buscarPedidosError,
    crearPedido,
    crearPedidoExito,
    crearPedidoError,
    cancelarPedido,
    cancelarPedidoExito,
    cancelarPedidoError,
} from '../actions/pedido.actions';
import { AppState } from '../app.state';

@Injectable()
export class PedidoEffects {

    constructor(
        private actions$: Actions,
        private pedidoService: PedidoService,
        private store: Store<AppState>,
        private alertService: CustomAlertService,
    ) {}

    cargarPedidosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarPedidos),
            switchMap(({ fromDate, toDate }) =>
                this.pedidoService.getPedidos(fromDate, toDate).pipe(
                    map((response) =>
                        cargarPedidosExito({
                            pedidos: response.results,
                            count: response.count,
                        })
                    ),
                    catchError((error) => of(cargarPedidosError({ error })))
                )
            )
        )
    );

    buscarPedidosEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(buscarPedidos),
            switchMap(({ page, page_size, filters }) =>
                this.pedidoService.buscarPedidos(page, page_size, filters).pipe(
                    map((response) =>
                        buscarPedidosExito({
                            pedidos: response.results,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages,
                        })
                    ),
                    catchError((error) => of(buscarPedidosError({ error })))
                )
            )
        )
    );

    crearPedidoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(crearPedido),
            exhaustMap(({ pedido }) =>
                this.pedidoService.crearPedido(pedido).pipe(
                    map((response) => {
                        this.alertService.showSuccess('Pedido registrado exitosamente', 'Exito').subscribe();
                        return crearPedidoExito({ pedido: response.pedido });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar el pedido', 'Error').subscribe();
                        return of(crearPedidoError({ error }));
                    })
                )
            )
        )
    );

    cancelarPedidoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cancelarPedido),
            exhaustMap(({ pedidoId }) =>
                this.pedidoService.cancelarPedido(pedidoId).pipe(
                    map((response) => {
                        this.alertService.showSuccess(response.mensaje || 'Pedido cancelado', 'Exito').subscribe();
                        return cancelarPedidoExito({ pedidoId, mensaje: response.mensaje });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al cancelar el pedido', 'Error').subscribe();
                        return of(cancelarPedidoError({ error }));
                    })
                )
            )
        )
    );
}
