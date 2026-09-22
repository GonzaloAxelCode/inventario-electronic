import { FeatureFlagsService } from '@/app/services/ui/feature-flags.service';
import { UserService } from '@/app/services/user.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modulossettings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modulossettings.component.html',
  styleUrl: './modulossettings.component.scss',
})
export class ModulossettingsComponent {
  constructor(
    public featureFlags: FeatureFlagsService,
    private userService: UserService
  ) {}

  toggleGuiasRemision(): void {
    this.featureFlags.toggleGuiasRemision();
    this.saveModulosConfig();
  }

  toggleCompras(): void {
    this.featureFlags.toggleCompras();
    this.saveModulosConfig();
  }

  toggleGanancias(): void {
    this.featureFlags.toggleGanancias();
    this.saveModulosConfig();
  }

  private saveModulosConfig(): void {
    const modulos: string[] = [];
    if (this.featureFlags.guiasRemisionEnabled()) {
      modulos.push('guias-de-remision');
    }
    if (this.featureFlags.comprasEnabled()) {
      modulos.push('compras');
    }
    if (this.featureFlags.gananciasEnabled()) {
      modulos.push('ganancias');
    }
    this.userService.updateUserConfig({ modulos_habilitados: modulos }).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('Error al guardar módulos:', error);
      }
    });
  }
}
