import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { WA_LOCAL_STORAGE, WA_WINDOW } from '@ng-web-apis/common';
import { TUI_DARK_MODE, TUI_DARK_MODE_KEY } from '@taiga-ui/core';
import { FeatureFlagsService } from '@/app/services/ui/feature-flags.service';
import { LayoutService } from '@/app/services/ui/layout-service.service';
import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { getLoginUserDataFromLocalStorage } from '@/app/services/utils/localstorage-functions';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';

@Component({
  selector: 'app-myaccount',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './myaccount.component.html',
  styleUrl: './myaccount.component.scss'
})
export class MyaccountComponent implements OnInit {
  userState$!: Observable<UserState>;
  user: User = initialStateUser.user;
  tienda!: Tienda;

  private readonly key = inject(TUI_DARK_MODE_KEY);
  private readonly storage = inject(WA_LOCAL_STORAGE);
  private readonly media = inject(WA_WINDOW).matchMedia('(prefers-color-scheme: dark)');
  protected readonly darkMode = inject(TUI_DARK_MODE);
  private isDarkMode = false;
  private isTopnavLayout = false;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    public layoutService: LayoutService,
    public featureFlags: FeatureFlagsService
  ) {
    this.userState$ = this.store.select(selectUsersState);
  }

  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;
      this.tienda = userState.user?.tienda_data || {} as Tienda;
      this.syncPreferencesFromUser();
    });
  }

  private syncPreferencesFromUser(): void {
    const saved = this.storage.getItem(this.key);
    if (saved !== null) {
      this.isDarkMode = saved === 'true';
    } else {
      this.isDarkMode = this.media.matches;
    }
    this.darkMode.set(this.isDarkMode);

    this.isTopnavLayout = this.layoutService.isTopnav();
  }

  get fullName(): string {
    return [this.user.first_name, this.user.last_name].filter(Boolean).join(' ') || 'Sin nombre';
  }

  get initials(): string {
    return `${this.user.first_name?.charAt(0) || 'U'}${this.user.last_name?.charAt(0) || ''}`;
  }

  get roleLabel(): string {
    if (this.user.is_superuser) return 'Administrador';
    if (this.user.is_staff) return 'Staff';
    return 'Personal';
  }

  get activePermissionsCount(): number {
    if (!this.user?.permissions) return 0;
    return Object.values(this.user.permissions).filter(Boolean).length;
  }

  get accountAgeDays(): number {
    if (!this.user.date_joined) return 0;
    const joined = new Date(this.user.date_joined).getTime();
    return Math.max(0, Math.floor((Date.now() - joined) / 86400000));
  }

  get themeDisplay(): string {
    return this.user.theme === 'dark' ? 'Oscuro' : 'Claro';
  }

  get navbarDisplay(): string {
    return this.user.navbar_type === 'top' ? 'Superior' : 'Lateral';
  }

  get guiasRemisionActive(): boolean {
    return this.user.modulos_habilitados?.includes('guias de remision') ?? false;
  }

  get tiktokActive(): boolean {
    return this.user.modulos_habilitados?.includes('tiktok') ?? false;
  }

  get comprasActive(): boolean {
    return this.user.modulos_habilitados?.includes('compras') ?? false;
  }

  toggleTheme(): void {
    const newTheme = this.user.theme === 'dark' ? 'light' : 'dark';
    this.user = { ...this.user, theme: newTheme };
    this.isDarkMode = newTheme === 'dark';
    this.darkMode.set(this.isDarkMode);
    this.storage.setItem(this.key, String(this.isDarkMode));
  }

  toggleNavbar(): void {
    const newNavbar = this.user.navbar_type === 'top' ? 'normal' : 'top';
    this.user = { ...this.user, navbar_type: newNavbar };
    const mode: 'topnav' | 'sidebar' = newNavbar === 'top' ? 'topnav' : 'sidebar';
    this.layoutService.setLayout(mode);
    this.isTopnavLayout = newNavbar === 'top';
  }

  toggleModulo(modulo: string): void {
    const current = this.user.modulos_habilitados || [];
    const exists = current.includes(modulo);
    const newModulos = exists
      ? current.filter(m => m !== modulo)
      : [...current, modulo];
    this.user = { ...this.user, modulos_habilitados: newModulos };

    switch (modulo) {
      case 'guias de remision':
        this.featureFlags.toggleGuiasRemision();
        break;
      case 'tiktok':
        this.featureFlags.toggleTiktok();
        break;
      case 'compras':
        this.featureFlags.toggleCompras();
        break;
    }
  }
}
