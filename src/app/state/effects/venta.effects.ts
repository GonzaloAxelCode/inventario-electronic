
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';

import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { VentaService } from '@/app/services/venta.service';
import { forceSyncClientes } from '../actions/cliente.actions';
import { forceSyncInventarios } from '../actions/inventario.actions';
import {
    anularVenta,
    anularVentaError,
    anularVentaExito,
    cancelarVenta,
    cancelarVentaError,
    cancelarVentaExito,
    cargarResumenVentas,
    cargarResumenVentasByDate,
    cargarResumenVentasByDateError,
    cargarResumenVentasByDateExito,
    cargarResumenVentasError,
    cargarResumenVentasExito,

    cargarTopProductosVentasHoy,

    cargarTopProductosVentasHoyError,

    cargarTopProductosVentasHoyExito,
    cargarVentasRangoFechasTienda,
    cargarVentasRangoFechasTiendaError,
    cargarVentasRangoFechasTiendaExito,
    cargarVentasTienda,
    cargarVentasTiendaError,
    cargarVentasTiendaErrorToday,
    cargarVentasTiendaExito,
    cargarVentasTiendaExitoToday,
    crearVenta,
    crearVentaError,
    crearVentaExito,
    generarComprobanteVenta,
    generarComprobanteVentaError,
    generarComprobanteVentaExito,
    searchVenta,
    searchVentaFail,
    searchVentaSuccess
} from '../actions/venta.actions';
import { AppState } from '../app.state';

@Injectable()
export class VentaEffects {

    constructor(
        private actions$: Actions,
        private ventaService: VentaService,
        private store: Store<AppState>,
        private toastr: ToastrService,
        private alertService: CustomAlertService,
        private dialogServiceVentaDetail: DialogVentaDetailService
    ) { }
    loadVentasTiendaHoyEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarVentasRangoFechasTienda),
            exhaustMap(() =>
                this.ventaService.getVentasHoy().pipe(
                    map(response => {

                        return cargarVentasTiendaExitoToday({ ventasToday: response.results.filter((venta: any) => venta.estado !== 'PENDIENTE') });
                    }),
                    catchError(error => of(cargarVentasTiendaErrorToday({ error })))
                )
            )
        )
    );
    loadVentasPorRangoFechasTiendaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarVentasRangoFechasTienda),
            exhaustMap(({ fromDate, toDate }) =>
                this.ventaService.getVentasPorRangoFechasTienda(fromDate, toDate).pipe(
                    map(response => {

                        return cargarVentasRangoFechasTiendaExito({ salesDateRangePerDay: response.salesDateRangePerDay });
                    }),
                    catchError(error => of(cargarVentasRangoFechasTiendaError({ error })))
                )
            )
        )
    );

    loadResumenVentasByDateEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarResumenVentasByDate), // La acción que despacha el efecto
            exhaustMap(({ year, month, day, tipo }) =>
                this.ventaService.getResumenVentasByDate({ year, month, day, tipo }).pipe(
                    map(response => {
                        // Acción que despacha los datos obtenidos
                        return cargarResumenVentasByDateExito({
                            todaySales: response.todaySales,
                            thisMonthSales: response.thisMonthSales,
                            tipo: response.tipo
                        });
                    }),
                    catchError(error => {
                        // Si ocurre un error, se maneja con la acción de error
                        this.alertService.showError('Error al obtener el resumen de ventas', 'Error').subscribe();
                        return of(cargarResumenVentasByDateError({ error }));
                    })
                )
            )
        )
    );



    loadTopProductosMasVendidosHoyEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarTopProductosVentasHoy),
            exhaustMap(() =>
                this.ventaService.getTopProductosMasVendidosHoy().pipe(
                    map((response: any) =>
                        cargarTopProductosVentasHoyExito({ topProductoMostSales: response.results })
                    ),
                    catchError(error =>
                        of(cargarTopProductosVentasHoyError({ error }))
                    )
                )
            )
        )
    );


    loadVentasTiendaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarVentasTienda),
            exhaustMap(({ from_date, to_date, page, page_size }) =>
                this.ventaService.getVentasPorTienda(from_date, to_date, page, page_size).pipe(
                    map(response => {

                        return cargarVentasTiendaExito({

                            ventas: response.results.filter((venta: any) => venta.estado !== 'PENDIENTE'),
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages
                        });
                    }),
                    catchError(error => {

                        return of(cargarVentasTiendaError({ error }));
                    })
                )
            )
        )
    );


    createVentaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(crearVenta),
            exhaustMap(({ venta }) => {

                const servicio =
                    venta.tipoComprobante === 'Anonima'
                        ? this.ventaService.createVenta(venta)
                        : venta.is_send_sunat
                            ? this.ventaService.createVenta(venta)
                            : this.ventaService.createVentaPendiente(venta);

                return servicio.pipe(
                    mergeMap(createdVenta => {

                        // 🔔 Mensajes UI
                        if (createdVenta?.comprobante?.estado_sunat === 'RECHAZADO') {
                            this.alertService
                                .showError(
                                    'La venta fue creada pero el comprobante fue rechazado por SUNAT. Intente registrarlo más tarde.',
                                    'Error SUNAT'
                                )
                                .subscribe();
                        } else {
                            this.alertService
                                .showSuccess(
                                    'Venta creada exitosamente y fue aceptada por SUNAT',
                                    'Éxito'
                                )
                                .subscribe();

                            this.dialogServiceVentaDetail
                                .open(createdVenta)
                                .subscribe();
                        }

                        // 🚀 Despacha múltiples acciones
                        return [
                            crearVentaExito({ venta: createdVenta }),
                            forceSyncInventarios(),
                            forceSyncClientes()
                        ];
                    }),

                    catchError(error => {
                        this.alertService
                            .showError('Error al crear la venta', 'Error')
                            .subscribe();

                        return of(crearVentaError({ error }));
                    })
                );
            })
        )
    );

    cancelarVentaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cancelarVenta),
            exhaustMap(({ ventaId }) =>
                this.ventaService.cancelarVenta(ventaId).pipe(
                    map(() => {
                        this.alertService.showSuccess('Venta cancelada exitosamente', 'Éxito').subscribe();
                        return cancelarVentaExito({ ventaId });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al cancelar la venta', 'Error').subscribe();
                        return of(cancelarVentaError({ error }));
                    })
                )
            )
        )
    );



    cargarResumenVentasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(cargarResumenVentas),
            exhaustMap(() =>
                this.ventaService.obtenerResumenVentas().pipe(
                    map((res) => {

                        return cargarResumenVentasExito({
                            todaySales: res.todaySales,
                            thisMonthSales: res.thisMonthSales, thisWeekSales: res.thisWeekSales
                        });
                    }),
                    catchError(error => {

                        return of(cargarResumenVentasError({ error }));
                    })
                )
            )
        )
    );




    searchVentasEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(searchVenta),
            exhaustMap((action) =>
                this.ventaService.fetchSearchVentas(action.query, action.page || 1, action.page_size || 30).pipe(
                    map(response => {

                        return searchVentaSuccess({
                            ventas: response.results.filter((venta: any) => venta.estado !== 'PENDIENTE'),
                            search_ventas_found: response.search_ventas_found,
                            count: response.count,
                            next: response.next,
                            previous: response.previous,
                            index_page: response.index_page,
                            length_pages: response.length_pages
                        });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al buscar las ventas', 'Error').subscribe();
                        return of(searchVentaFail({ error }));
                    })
                )
            )
        )
    );

    anularVentaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(anularVenta),
            exhaustMap(({ ventaId, venta, motivo, tipo_motivo, anonima }) =>
                this.ventaService
                    .anularVenta(ventaId, motivo, tipo_motivo, anonima)
                    .pipe(
                        mergeMap(response => {
                            // 🔔 UI
                            this.alertService
                                .showSuccess(
                                    'La venta fue anulada correctamente',
                                    'Nota de Crédito emitida'
                                )
                                .subscribe();

                            this.dialogServiceVentaDetail
                                .open({
                                    ...venta,
                                    comprobante_nota_credito: response.comprobante_nota_credito
                                })
                                .subscribe();

                            // 🚀 Múltiples acciones
                            return [
                                anularVentaExito({
                                    ventaId,
                                    comprobante_nota_credito: response.comprobante_nota_credito
                                }),
                                forceSyncInventarios()
                            ];
                        }),

                        catchError(error => {
                            this.alertService
                                .showError('No se pudo anular la venta', 'Error')
                                .subscribe();

                            return of(anularVentaError({ error }));
                        })
                    )
            )
        )
    );



    generarComprobanteVentaEffect = createEffect(() =>
        this.actions$.pipe(
            ofType(generarComprobanteVenta),
            exhaustMap(({ ventaId }) =>
                this.ventaService.generarComprobanteVenta(ventaId).pipe(
                    map((venta) => {
                        this.alertService.showSuccess('Comprobante generado exitosamente', 'Éxito').subscribe();
                        return generarComprobanteVentaExito({ venta });
                    }),
                    catchError(error => {
                        this.alertService.showError('Error al generar el comprobante', 'Error').subscribe();
                        return of(generarComprobanteVentaError({ error }));
                    })
                )
            )
        )
    );


}
