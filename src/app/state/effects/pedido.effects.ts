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
    crearPedido,
    crearPedidoExito,
    crearPedidoError,
    actualizarPedido,
    actualizarPedidoExito,
    actualizarPedidoError,
    cancelarPedido,
    cancelarPedidoExito,
    cancelarPedidoError,
    eliminarPedido,
    eliminarPedidoExito,
    eliminarPedidoError,
    pagarPedido,
    pagarPedidoExito,
    pagarPedidoError,
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
            switchMap(({ page, page_size, filters }) =>
                this.pedidoService.getPedidos(page, page_size, filters).pipe(
                    map((response) =>
                        cargarPedidosExito({
                            pedidos: response.results,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages,
                        })
                    ),
                    catchError((error) => of(cargarPedidosError({ error })))
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

    actualizarPedidoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(actualizarPedido),
            exhaustMap(({ pedidoId, data }) =>
                this.pedidoService.actualizarPedido(pedidoId, data).pipe(
                    map((response) => {
                        this.alertService.showSuccess(response.mensaje || 'Pedido actualizado', 'Exito').subscribe();
                        return actualizarPedidoExito({ pedido: response.pedido, mensaje: response.mensaje });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al actualizar el pedido', 'Error').subscribe();
                        return of(actualizarPedidoError({ error }));
                    })
                )
            )
        )
    );

    eliminarPedidoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(eliminarPedido),
            exhaustMap(({ pedidoId }) =>
                this.pedidoService.eliminarPedido(pedidoId).pipe(
                    map((response) => {
                        this.alertService.showSuccess(response.mensaje || 'Pedido eliminado permanentemente', 'Exito').subscribe();
                        return eliminarPedidoExito({ pedidoId, mensaje: response.mensaje });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al eliminar el pedido', 'Error').subscribe();
                        return of(eliminarPedidoError({ error }));
                    })
                )
            )
        )
    );

    pagarPedidoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(pagarPedido),
            exhaustMap(({ pedidoId, data }) =>
                this.pedidoService.pagarPedido(pedidoId, data).pipe(
                    map((response) => {
                        this.alertService.showSuccess(response.mensaje || 'Pedido marcado como pagado', 'Exito').subscribe();
                        return pagarPedidoExito({ pedido: response.pedido, mensaje: response.mensaje });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al pagar el pedido', 'Error').subscribe();
                        return of(pagarPedidoError({ error }));
                    })
                )
            )
        )
    );
}
