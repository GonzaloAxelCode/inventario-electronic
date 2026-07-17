import { checkTokenAction } from '@/app/state/actions/auth.actions';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

@Injectable()
export class AppEffects {
    constructor(private actions$: Actions, private store: Store) { }

    init$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType('@ngrx/effects/init'),
                tap(() => {
                    this.store.dispatch(checkTokenAction());
                })
            ),
        { dispatch: false }
    );
}
