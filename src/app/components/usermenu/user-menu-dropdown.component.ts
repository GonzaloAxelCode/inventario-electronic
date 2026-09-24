import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { LogoutService } from '@/app/services/logout.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TUI_DARK_MODE } from '@taiga-ui/core';
import { DarkmodeComponent } from '../darkmode/darkmode.component';
import { PlanbadgeComponent } from '../planbadge/planbadge.component';

/**
 * Contenido del dropdown de usuario compartido entre nav top y nav lateral.
 * El contenedor posicionado (.user-dropdown) lo pone cada nav; aquí solo va el contenido.
 */
@Component({
  selector: 'app-user-menu-dropdown',
  standalone: true,
  imports: [CommonModule, DarkmodeComponent, PlanbadgeComponent],
  templateUrl: './user-menu-dropdown.component.html',
  styleUrl: './user-menu-dropdown.component.scss',
})
export class UserMenuDropdownComponent {
  @Input() user!: User;
  @Input() tienda!: Tienda;
  @Output() closed = new EventEmitter<void>();

  private router = inject(Router);
  private logoutService = inject(LogoutService);
  private readonly darkMode = inject(TUI_DARK_MODE);

  navigateTo(route: string): void {
    const [path, fragment] = route.split('#');
    this.router.navigate([path], { fragment: fragment || undefined });
    this.closed.emit();
  }

  toggleTheme(event: Event): void {
    event.stopPropagation();
    this.darkMode.set(!this.darkMode());
    localStorage.setItem('tui-dark-mode', String(this.darkMode()));
  }

  logout(): void {
    this.logoutService.logout();
    this.closed.emit();
  }
}
