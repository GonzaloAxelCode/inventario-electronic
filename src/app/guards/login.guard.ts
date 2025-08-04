import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectAuth } from '../state/selectors/auth.selectors';

export const loginGuard = (): Observable<boolean> => {
    const store = inject(Store<AppState>);
    const router = inject(Router);

    return store.select(selectAuth).pipe(

        filter(authState => !authState.loadingCheckAuthenticated),
        map(authState => !authState.isAuthenticated),
        tap(canAccessLogin => {
            if (!canAccessLogin) {
                router.navigate(['/']);
            }
        })
    );
};
