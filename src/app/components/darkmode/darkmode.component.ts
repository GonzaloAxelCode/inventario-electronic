import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
  selector: 'app-darkmode',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiTabs,
    TuiSwitch,
    TuiAppearance,
    TuiButton,
    TuiIcon,
    TuiLabel
  ],
  templateUrl: './darkmode.component.html',
  styleUrls: ['./darkmode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' })
  ],
})
export class DarkmodeComponent implements OnInit {

  private readonly key = inject(TUI_DARK_MODE_KEY);
  private readonly storage = inject(WA_LOCAL_STORAGE);
  private readonly media = inject(WA_WINDOW).matchMedia('(prefers-color-scheme: dark)');
  protected readonly darkMode = inject(TUI_DARK_MODE);

  // Propiedad para enlazar con el switch
  isDarkMode = false;

  ngOnInit(): void {
    const saved = this.storage.getItem(this.key);
    if (saved !== null) {
      this.isDarkMode = saved === 'true';
    } else {
      this.isDarkMode = this.media.matches;
    }
    this.darkMode.set(this.isDarkMode);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.darkMode.set(this.isDarkMode);
    this.storage.setItem(this.key, String(this.isDarkMode));
  }

  reset(): void {
    this.isDarkMode = this.media.matches;
    this.darkMode.set(this.isDarkMode);
    this.storage.removeItem(this.key);
  }
}
