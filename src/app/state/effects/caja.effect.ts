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
                        this.toastr.success('Caja iniciada', 'Éxito');
                        return createCajaSuccess({ caja, operaciones, caja_is_open });
                    }),
                    catchError((error) => {
                        this.toastr.error('Error al iniciar la caja', 'Error');
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
                        this.toastr.success('Gasto registrado', 'Éxito');
                        return realizarGastoSuccess({ operacion, caja });
                    }),
                    catchError((error) => {
                        this.toastr.error('Error al registrar el gasto', 'Error');
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
                        this.toastr.success('Ingreso registrado', 'Éxito');
                        return realizarIngresoSuccess({ operacion, caja });
                    }),
                    catchError((error) => {
                        this.toastr.error('Error al registrar el ingreso', 'Error');
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
                        this.toastr.success('Préstamo registrado', 'Éxito');
                        return realizarPrestamoSuccess({ operacion, caja });
                    }),
                    catchError((error) => {
                        this.toastr.error('Error al registrar el préstamo', 'Error');
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
                        this.toastr.success('Caja cerrada', 'Éxito');
                        return cerrarCajaSuccess({ caja_is_open: false });
                    }),
                    catchError((error) => {
                        this.toastr.error('Error al cerrar la caja', 'Error');
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
                        this.toastr.success('Caja reiniciada', 'Éxito');
                        return reinicializarCajaSuccess({ caja, operaciones, caja_is_open: true });
                    }),
                    catchError((error) => {
                        this.toastr.error('Error al reiniciar la caja', 'Error');
                        return of(reinicializarCajaFail({ error }));
                    })
                )
            )
        )
    );
}
