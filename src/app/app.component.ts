import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TUI_DARK_MODE } from '@taiga-ui/core';
import { loadUserAction } from './state/actions/user.actions';
import { AppState } from './state/app.state';
@Component({
  selector: 'app-root',
  template: `<tui-root [attr.tuiTheme]="!darkMode() ? 'dark' : null">
    <router-outlet></router-outlet>
</tui-root>`,

  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  protected readonly darkMode = inject(TUI_DARK_MODE);

  constructor(store: Store<AppState>) {

    store.dispatch(loadUserAction())
  }
}
