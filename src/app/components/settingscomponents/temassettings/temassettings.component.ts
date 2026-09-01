import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WA_LOCAL_STORAGE, WA_WINDOW } from '@ng-web-apis/common';
import { TUI_DARK_MODE, TUI_DARK_MODE_KEY, TuiAppearance, TuiIcon, TuiLabel, TuiTitle } from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider } from '@taiga-ui/kit';
import { LayoutService, LayoutMode } from '@/app/services/ui/layout-service.service';
import { FeatureFlagsService } from '@/app/services/ui/feature-flags.service';
import { UserService } from '@/app/services/user.service';

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
  private readonly mobileMedia = inject(WA_WINDOW).matchMedia('(max-width: 768px)');
  protected readonly darkMode = inject(TUI_DARK_MODE);

  constructor(
    public layoutService: LayoutService,
    public featureFlags: FeatureFlagsService,
    private userService: UserService
  ) {}

  isDarkMode = false;
  isTopnavLayout = false;
  isMobile = false;

  ngOnInit(): void {
    const saved = this.storage.getItem(this.key);
    if (saved !== null) {
      this.isDarkMode = saved === 'true';
    } else {
      this.isDarkMode = this.media.matches;
    }
    this.darkMode.set(this.isDarkMode);

    this.isTopnavLayout = this.layoutService.isTopnav();
    this.isMobile = this.mobileMedia.matches;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.darkMode.set(this.isDarkMode);
    this.storage.setItem(this.key, String(this.isDarkMode));
    this.saveConfig({ theme: this.isDarkMode ? 'dark' : 'light' });
  }

  toggleLayout(): void {
    this.isTopnavLayout = !this.isTopnavLayout;
    const mode: LayoutMode = this.isTopnavLayout ? 'topnav' : 'sidebar';
    this.layoutService.setLayout(mode);
    this.saveConfig({ navbar_type: this.isTopnavLayout ? 'top' : 'normal' });
  }

  toggleGuiasRemision(): void {
    this.featureFlags.toggleGuiasRemision();
    this.saveModulosConfig();
  }

  toggleTiktok(): void {
    this.featureFlags.toggleTiktok();
    this.saveModulosConfig();
  }

  toggleCompras(): void {
    this.featureFlags.toggleCompras();
    this.saveModulosConfig();
  }

  private saveModulosConfig(): void {
    const modulos: string[] = [];
    if (this.featureFlags.guiasRemisionEnabled()) {
      modulos.push('guias-de-remision');
    }
    if (this.featureFlags.tiktokEnabled()) {
      modulos.push('tiktok');
    }
    if (this.featureFlags.comprasEnabled()) {
      modulos.push('compras');
    }
    this.saveConfig({ modulos_habilitados: modulos });
  }

  private saveConfig(config: {
    theme?: 'light' | 'dark';
    navbar_type?: 'top' | 'normal';
    modulos_habilitados?: string[];
  }): void {
    this.userService.updateUserConfig(config).subscribe({
      next: (response) => {
        console.log('Configuración guardada:', response);
      },
      error: (error) => {
        console.error('Error al guardar configuración:', error);
      }
    });
  }
}
