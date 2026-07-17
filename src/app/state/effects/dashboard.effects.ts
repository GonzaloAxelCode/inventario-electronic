import { PAGE_SIZE_PRODUCTS, PAGE_SIZE_VENTAS } from '@/app/services/utils/pages-sizes';
import { cargarProductosMenorStock, loadInventarios } from '@/app/state/actions/inventario.actions';
import { loadProductosAction } from '@/app/state/actions/producto.actions';
import {
    cargarResumenVentas,
    cargarTopProductosVentasHoy,
    cargarVentasRangoFechasTienda,
    cargarVentasTienda,
    cargarVentasTiendaToday
} from '@/app/state/actions/venta.actions';
import { loadUserSuccess } from '@/app/state/actions/user.actions';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { tap } from 'rxjs/operators';

@Injectable()
export class DashboardEffects {
    constructor(private actions$: Actions, private store: Store) { }

    private initialRange = new TuiDayRange(
        new TuiDay(2025, 11, 1),
        new TuiDay(2026, 11, 31)
    );

    loadDashboardData$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadUserSuccess),
                tap(() => {
                    this.store.dispatch(cargarResumenVentas());
                    this.store.dispatch(cargarTopProductosVentasHoy());
                    this.store.dispatch(cargarVentasTiendaToday());
                    this.store.dispatch(cargarVentasTienda({
                        from_date: [this.initialRange.from.year, this.initialRange.from.month, this.initialRange.from.day],
                        to_date: [this.initialRange.to.year, this.initialRange.to.month, this.initialRange.to.day],
                        page: 1,
                        page_size: PAGE_SIZE_VENTAS
                    }));
                    this.store.dispatch(cargarVentasRangoFechasTienda({
                        fromDate: new Date(
                            this.initialRange.from.year,
                            this.initialRange.from.month,
                            this.initialRange.from.day
                        ),
                        toDate: new Date(
                            this.initialRange.to.year,
                            this.initialRange.to.month,
                            this.initialRange.to.day
                        )
                    }));
                    this.store.dispatch(loadInventarios());
                    this.store.dispatch(cargarProductosMenorStock());
                    this.store.dispatch(loadProductosAction({
                        page: 1,
                        page_size: PAGE_SIZE_PRODUCTS
                    }));
                })
            ),
        { dispatch: false }
    );
}
