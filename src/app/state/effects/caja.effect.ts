import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';

import { CajaService } from '@/app/services/caja.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import {
    cerrarCaja,
    cerrarCajaFail,
    cerrarCajaSuccess,
    createCaja,
    createCajaFail,
    createCajaSuccess,
    loadCaja,
    loadCajaFail,
    loadCajaSuccess,
    realizarGasto,
    realizarGastoFail,
    realizarGastoSuccess,
    realizarIngreso,
    realizarIngresoFail,
    realizarIngresoSuccess,
    realizarPrestamo,
    realizarPrestamoFail,
    realizarPrestamoSuccess,
    reinicializarCaja,
    reinicializarCajaFail,
    reinicializarCajaSuccess,
} from '../actions/caja.actions';

import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, of } from 'rxjs';

@Injectable()
export class CajaEffects {
    constructor(
        private actions$: Actions,
        private cajaService: CajaService,
        private store: Store<AppState>,
        private alertService: CustomAlertService,
        private toastr: ToastrService
    ) { }

    // Efecto para cargar caja abierta
    loadCajaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(loadCaja),
            exhaustMap(() =>
                this.cajaService.getCajaAbierta().pipe(
                    map(({ caja, operaciones, caja_is_open }) => {
                        console.log("effect", caja, operaciones, caja_is_open);
                        return loadCajaSuccess({ caja, operaciones, caja_is_open })
                    }),
                    catchError((error) => of(loadCajaFail({ error })))
                )
            )
        )
    );

    // Efecto para crear nueva caja
    createCajaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(createCaja),
            exhaustMap(({ saldoInicial, }) =>
                this.cajaService.createCaja(saldoInicial,).pipe(
                    map(({ caja, operaciones, caja_is_open }) => {
                        this.alertService.showSuccess('Caja iniciada', 'Éxito').subscribe();
                        return createCajaSuccess({ caja, operaciones, caja_is_open });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al iniciar la caja', 'Error').subscribe();
                        return of(createCajaFail({ error }));
                    })
                )
            )
        )
    );


    // Efecto para realizar un gasto
    realizarGastoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(realizarGasto),
            exhaustMap(({ cajaId, monto, descripcion, }) =>
                this.cajaService.realizarGasto(cajaId, monto, descripcion,).pipe(
                    map(({ operacion, caja }) => {
                        this.alertService.showSuccess('Gasto registrado', 'Éxito').subscribe();
                        return realizarGastoSuccess({ operacion, caja });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar el gasto', 'Error').subscribe();
                        return of(realizarGastoFail({ error }));
                    })
                )
            )
        )
    );

    // Efecto para realizar un ingreso
    realizarIngresoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(realizarIngreso),
            exhaustMap(({ cajaId, monto, descripcion }) =>
                this.cajaService.realizarIngreso(cajaId, monto, descripcion,).pipe(
                    map(({ operacion, caja }) => {
                        this.alertService.showSuccess('Ingreso registrado', 'Éxito').subscribe();
                        return realizarIngresoSuccess({ operacion, caja });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar el ingreso', 'Error').subscribe();
                        return of(realizarIngresoFail({ error }));
                    })
                )
            )
        )
    );

    // Efecto para registrar un préstamo
    registrarPrestamoEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(realizarPrestamo),
            exhaustMap(({ monto, descripcion, }) =>
                this.cajaService.registrarPrestamo(monto, descripcion,).pipe(
                    map(({ operacion, caja }) => {
                        this.alertService.showSuccess('Préstamo registrado', 'Éxito').subscribe();
                        return realizarPrestamoSuccess({ operacion, caja });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al registrar el préstamo', 'Error').subscribe();
                        return of(realizarPrestamoFail({ error }));
                    })
                )
            )
        )
    );

    // Efecto para cerrar caja
    cerrarCajaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cerrarCaja),
            exhaustMap(({ cajaId, }) =>
                this.cajaService.cerrarCaja(cajaId,).pipe(
                    map((res) => {
                        this.alertService.showSuccess('Caja cerrada', 'Éxito').subscribe();
                        return cerrarCajaSuccess({ caja_is_open: false });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al cerrar la caja', 'Error').subscribe();
                        return of(cerrarCajaFail({ error }));
                    })
                )
            )
        )
    );

    // Efecto para reiniciar caja
    reiniciarCajaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(reinicializarCaja),
            exhaustMap(({ cajaId, saldoInicial }) =>
                this.cajaService.reinicializarCaja(cajaId, saldoInicial).pipe(
                    map(({ caja, operaciones }) => {
                        this.alertService.showSuccess('Caja reiniciada', 'Éxito').subscribe();
                        return reinicializarCajaSuccess({ caja, operaciones, caja_is_open: true });
                    }),
                    catchError((error) => {
                        this.alertService.showError('Error al reiniciar la caja', 'Error').subscribe();
                        return of(reinicializarCajaFail({ error }));
                    })
                )
            )
        )
    );
}
