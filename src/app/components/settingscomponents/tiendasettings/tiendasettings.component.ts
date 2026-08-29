import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TUI_DARK_MODE, TuiAppearance, TuiIcon, TuiLabel, TuiTitle } from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider } from '@taiga-ui/kit';

@Component({
  selector: 'app-tiendasettings',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiSwitch, TuiAppearance, TuiIcon, TuiLabel, TuiTitle],
  templateUrl: './tiendasettings.component.html',
  styleUrl: './tiendasettings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' })],
})
export class TiendaSettingsComponent {
  protected readonly darkMode = inject(TUI_DARK_MODE);
}
