import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WA_LOCAL_STORAGE, WA_WINDOW } from '@ng-web-apis/common';
import { TUI_DARK_MODE, TUI_DARK_MODE_KEY, TuiAppearance, TuiIcon, TuiLabel, TuiTitle } from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider } from '@taiga-ui/kit';
import { LayoutService, LayoutMode } from '@/app/services/ui/layout-service.service';

@Component({
  selector: 'app-temassettings',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiSwitch, TuiAppearance, TuiIcon, TuiLabel, TuiTitle],
  templateUrl: './temassettings.component.html',
  styleUrl: './temassettings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' })],
})
export class TemasSettingsComponent implements OnInit {
  private readonly key = inject(TUI_DARK_MODE_KEY);
  private readonly storage = inject(WA_LOCAL_STORAGE);
  private readonly media = inject(WA_WINDOW).matchMedia('(prefers-color-scheme: dark)');
  protected readonly darkMode = inject(TUI_DARK_MODE);
  
  constructor(public layoutService: LayoutService) {}

  isDarkMode = false;
  isTopnavLayout = false;

  ngOnInit(): void {
    const saved = this.storage.getItem(this.key);
    if (saved !== null) {
      this.isDarkMode = saved === 'true';
    } else {
      this.isDarkMode = this.media.matches;
    }
    this.darkMode.set(this.isDarkMode);
    
    this.isTopnavLayout = this.layoutService.isTopnav();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.darkMode.set(this.isDarkMode);
    this.storage.setItem(this.key, String(this.isDarkMode));
  }

  toggleLayout(): void {
    this.isTopnavLayout = !this.isTopnavLayout;
    const mode: LayoutMode = this.isTopnavLayout ? 'topnav' : 'sidebar';
    this.layoutService.setLayout(mode);
  }

  resetTheme(): void {
    this.isDarkMode = this.media.matches;
    this.darkMode.set(this.isDarkMode);
    this.storage.removeItem(this.key);
  }
}
