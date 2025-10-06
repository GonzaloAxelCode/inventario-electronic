import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TUI_DARK_MODE } from '@taiga-ui/core';
import { combineLatest, map } from 'rxjs';
import { AppState } from './state/app.state';
import { selectAuth } from './state/selectors/auth.selectors';
import { selectUser } from './state/selectors/user.selectors';
@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  protected readonly darkMode = inject(TUI_DARK_MODE);
  loading$ = combineLatest([
    this.store.select(selectAuth),
    this.store.select(selectUser),
  ]).pipe(
    map(([auth, user]) =>
      auth.loadingCheckAuthenticated || user.loadingCurrentUser
    )
  );
  constructor(private store: Store<AppState>) {


  }
}
//freddy199393@gmail.com (validado)	
