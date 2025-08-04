import { Component, inject } from '@angular/core';
import { TUI_DARK_MODE } from '@taiga-ui/core';




@Component({
  selector: 'app-root',
  template: `<tui-root [attr.tuiTheme]="!darkMode() ? 'dark' : null">
    <router-outlet></router-outlet>
</tui-root>`,

  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  protected readonly darkMode = inject(TUI_DARK_MODE);


}
