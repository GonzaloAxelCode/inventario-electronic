import { PAGE_SIZE_PRODUCTS, PAGE_SIZE_VENTAS } from '@/app/services/utils/pages-sizes';
import { checkTokenAction } from '@/app/state/actions/auth.actions';
import { loadCategorias } from '@/app/state/actions/categoria.actions';
import { cargarProductosMenorStock, loadInventarios } from '@/app/state/actions/inventario.actions';
import { loadProductosAction } from '@/app/state/actions/producto.actions';
import { loadTiendasAction } from '@/app/state/actions/tienda.actions';
import { loadUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { loadClientes } from '../actions/cliente.actions';
import { cargarResumenVentas, cargarTopProductosVentasHoy, cargarVentasRangoFechasTienda, cargarVentasTienda, cargarVentasTiendaToday } from '../actions/venta.actions';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions, private store: Store<AppState>) { }
    private _range = new BehaviorSubject<TuiDayRange>(
        new TuiDayRange(
            new TuiDay(2025, 0, 1),
            new TuiDay(2025, 11, 31)
        )
    );
    range$ = this._range.asObservable();


    get range(): TuiDayRange {
        return this._range.value;
    }
    init$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType('@ngrx/effects/init'),
                tap(() => {
                    const initialRange = this.range;
                    this.store.dispatch(checkTokenAction());
                    this.store.dispatch(loadUserAction());
                    this.store.dispatch(loadInventarios());
                    this.store.dispatch(loadProductosAction({ page: 1, page_size: PAGE_SIZE_PRODUCTS }));
                    this.store.dispatch(cargarVentasTiendaToday())
                    this.store.dispatch(cargarVentasTienda({
                        page_size: PAGE_SIZE_VENTAS,
                        page: 1,
                        from_date: [initialRange.from.year, initialRange.from.month, initialRange.from.day],
                        to_date: [initialRange.to.year, initialRange.to.month, initialRange.to.day]

                    }))
                    this.store.dispatch(cargarTopProductosVentasHoy());
                    this.store.dispatch(cargarResumenVentas());

                    this.store.dispatch(loadTiendasAction());
                    this.store.dispatch(cargarProductosMenorStock());

                    this.store.dispatch(cargarVentasRangoFechasTienda({

                        fromDate: new Date(initialRange.from.year, initialRange.from.month, initialRange.from.day),
                        toDate: new Date(initialRange.to.year, initialRange.to.month, initialRange.to.day)
                    }));
                    this.store.dispatch(loadCategorias());
                    this.store.dispatch(loadClientes());
                    // this.store.dispatch(loadCaja());

                })
            ),
        { dispatch: false }
    );
}
