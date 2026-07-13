import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';

import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { CompraService } from '@/app/services/compra.service';
import {
    cargarCompras,
    cargarComprasExito,
    cargarComprasError,
    crearCompra,
    crearCompraExito,
    crearCompraError,
} from '../actions/compra.actions';
import { AppState } from '../app.state';

@Injectable()
export class CompraEffects {

    constructor(
        private actions$: Actions,
        private compraService: CompraService,
        private store: Store<AppState>,
        private alertService: CustomAlertService,
    ) {}

    cargarComprasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarCompras),
            switchMap(({ page, page_size }) =>
                this.compraService.getComprobantes(page, page_size).pipe(
                    map((response) =>
                        cargarComprasExito({
                            comprobantes: response.results,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages,
                        })
                    ),
                    catchError((error) => of(cargarComprasError({ error })))
                )
            )
        )
    );

    crearCompraEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(crearCompra),
            exhaustMap(({ compra }) =>
                this.compraService.crearComprobante(compra).pipe(
                    map((response) => {
                        this.alertService.showSuccess('Comprobante registrado exitosamente', 'Exito').subscribe();
                        return crearCompraExito({ comprobante: response.comprobante });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar el comprobante', 'Error').subscribe();
                        return of(crearCompraError({ error }));
                    })
                )
            )
        )
    );
}
