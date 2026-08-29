import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { FeatureFlagsService } from '@/app/services/ui/feature-flags.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { clearTokensAction } from '@/app/state/actions/auth.actions';
import { clearInventariosFromCache } from '@/app/state/actions/inventario.actions';
import { clearUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiButton, TUI_DARK_MODE } from '@taiga-ui/core';
import { map, Observable } from 'rxjs';
import { DarkmodeComponent } from '../darkmode/darkmode.component';

@Component({
  selector: 'app-topnavadmin',
  standalone: true,
  imports: [CommonModule, RouterModule, TuiButton, DarkmodeComponent],
  templateUrl: './topnavadmin.component.html',
  styleUrl: './topnavadmin.component.scss'
})
export class TopnavAdminComponent implements OnInit {
  user!: User;
  tienda!: Tienda;
  userMenuOpen = false;
  mobileMenuOpen = false;
  URL_BASE = URL_BASE;
  private readonly darkMode = inject(TUI_DARK_MODE);

  constructor(
    private store: Store<AppState>,
    public router: Router,
    public featureFlags: FeatureFlagsService
  ) {}

  toggleTheme(event: Event): void {
    event.stopPropagation();
    this.darkMode.set(!this.darkMode());
    localStorage.setItem('tui-dark-mode', String(this.darkMode()));
  }

  ngOnInit(): void {
    this.store.select(selectUsersState).subscribe(state => {
      this.user = state.user;
      this.tienda = (state.user as any)?.tienda_data ?? {} as Tienda;
    });
  }

  get isSuperUser(): boolean {
    return !!this.user?.is_superuser;
  }

  get isAdminTienda(): boolean {
    if (!this.user || this.isSuperUser) return false;
    return (this.user as any).es_propietario === true;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
  }

  logout2(): void {
    this.store.dispatch(clearTokensAction());
    this.store.dispatch(clearUserAction());
    this.store.dispatch(clearInventariosFromCache());
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) this.userMenuOpen = false;
    if (!target.closest('.mobile-menu-container')) this.mobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
  }
}
