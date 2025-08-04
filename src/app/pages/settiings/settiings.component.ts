import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WA_LOCAL_STORAGE, WA_WINDOW } from '@ng-web-apis/common';
import {
  TUI_DARK_MODE, TUI_DARK_MODE_KEY,
  TuiAppearance, TuiButton,
  TuiIcon,
  TuiLabel
} from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider, TuiTabs } from '@taiga-ui/kit';


@Component({
  selector: 'app-settiings',
  standalone: true,
  imports: [CommonModule, TuiTabs, TuiSwitch, FormsModule, TuiAppearance, TuiButton, TuiIcon, TuiLabel
  ],
  templateUrl: './settiings.component.html',
  styleUrl: './settiings.component.scss', changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' })],
})
export class SettiingsComponent {

  private readonly key = inject(TUI_DARK_MODE_KEY);
  private readonly storage = inject(WA_LOCAL_STORAGE);
  private readonly media = inject(WA_WINDOW).matchMedia('(prefers-color-scheme: dark)');

  protected readonly darkMode = inject(TUI_DARK_MODE);

  protected reset(): void {
    this.darkMode.set(this.media.matches);
    this.storage.removeItem(this.key);
  }
  toggleDarkMode() {
    this.darkMode.set(!this.darkMode);
  }
}
