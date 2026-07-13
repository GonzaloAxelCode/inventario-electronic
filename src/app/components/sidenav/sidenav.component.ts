import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { SidebarService } from '@/app/services/ui/sidebar-service.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { clearTokensAction } from '@/app/state/actions/auth.actions';
import { clearInventariosFromCache } from '@/app/state/actions/inventario.actions';
import { clearUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { UserState } from '@/app/state/reducers/user.reducer';
import { selectAuth } from '@/app/state/selectors/auth.selectors';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLinkActive, RouterLinkWithHref, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TuiDropdownMobile } from '@taiga-ui/addon-mobile';
import {
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiDialogService,
  TuiDropdown,
  TuiFallbackSrcPipe,
  TuiIcon,
  TuiPopup,
  TuiTextfield,
  TuiTitle,
  TUI_DARK_MODE
} from '@taiga-ui/core';
import {
  TuiAvatar,
  TuiAvatarLabeled,
  TuiBadge,
  TuiDrawer,
  TuiPulse,
  TuiStatus,
  TuiTabs
} from '@taiga-ui/kit';
import { TuiCell, TuiNavigation } from '@taiga-ui/layout';
import { map, Observable } from 'rxjs';
import ChoosestoreComponent from '../choosestore/choosestore.component';
import { DarkmodeComponent } from '../darkmode/darkmode.component';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule, RouterModule,
    FormsModule,
    NgIf,
    TuiDataList,
    TuiDropdown,
    TuiNavigation,
    TuiTabs, TuiAvatarLabeled, TuiFallbackSrcPipe,
    TuiTextfield, RouterLinkActive, RouterLinkWithHref, TuiIcon, HeaderComponent,
    TuiDropdownMobile,
    TuiDrawer, TuiButton, TuiAppearance,
    TuiAvatar,
    TuiPopup, AsyncPipe, CommonModule,
    ReactiveFormsModule,
    TuiAvatar, RouterModule,
    TuiCell,
    TuiAppearance,
    TuiNavigation, TuiDropdown,
    TuiButton,
    TuiTextfield, TuiPulse,
    TuiTitle, DarkmodeComponent, ChoosestoreComponent, TuiDrawer, TuiButton, TuiAppearance,
    TuiAvatar, TuiDataList, TuiStatus, TuiBadge,
    TuiPopup, TuiIcon],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent implements OnInit {
  isAuthenticated$: Observable<any>;
  userState$!: Observable<UserState>;
  user!: User;
  tienda!: Tienda;
  userMenuOpen = false;
  loadingAuthenticated$: Observable<any>;
  authState$ = this.store.pipe(select(selectAuth));
  URL_BASE = URL_BASE;

  open = this.sidebarService.open;
  isopenSidebar = this.sidebarService.open;

  constructor(
    private store: Store<AppState>,
    public router: Router,
    public sidebarService: SidebarService
  ) {
    this.isAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.isAuthenticated)
    );
    this.loadingAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.loadingCheckAuthenticated)
    );
    this.userState$ = this.store.select(selectUsersState);
  }

  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;
      this.tienda = userState.user.tienda_data ?? {} as Tienda;
    });
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.userMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.userMenuOpen = false;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.userMenuOpen = false;
    this.onClose();
  }

  logout() {
    this.store.dispatch(clearTokensAction());
    this.store.dispatch(clearUserAction());
    this.onClose();
    this.router.navigate(['/login']);
  }

  logout2() {
    this.store.dispatch(clearTokensAction());
    this.store.dispatch(clearUserAction());
    this.store.dispatch(clearInventariosFromCache());
    this.onClose();
    this.router.navigate(['/login']);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  protected readonly dialogs = inject(TuiDialogService);
  private readonly darkMode = inject(TUI_DARK_MODE);

  toggleTheme(event: Event) {
    event.stopPropagation();
    this.darkMode.set(!this.darkMode());
    localStorage.setItem('tui-dark-mode', String(this.darkMode()));
  }

  public onClose(): void {
    this.open.set(false);
  }

  openSidebar() {
    this.open.set(true);
  }
}
