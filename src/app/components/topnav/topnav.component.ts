import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { SidebarService } from '@/app/services/ui/sidebar-service.service';
import { FeatureFlagsService } from '@/app/services/ui/feature-flags.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { LogoutService } from '@/app/services/logout.service';
import { AppState } from '@/app/state/app.state';
import { UserState } from '@/app/state/reducers/user.reducer';
import { selectAuth } from '@/app/state/selectors/auth.selectors';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { AsyncPipe, CommonModule, NgIf, NgFor } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TuiButton, TuiIcon, TUI_DARK_MODE } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { DarkmodeComponent } from '../darkmode/darkmode.component';
import { PlanbadgeComponent } from '../planbadge/planbadge.component';
import { UserMenuDropdownComponent } from '../usermenu/user-menu-dropdown.component';

export interface SubItem {
  route: string;
  label: string;
  icon: string;
  description?: string;
  accent?: string;
}

export interface NavItem {
  route: string;
  label: string;
  icon: string;
  exact?: boolean;
  superuserOnly?: boolean;
  featureFlag?: string;
  accent?: string;
  subItems?: SubItem[];
}

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgIf,
    NgFor,
    TuiButton,
    TuiIcon,
    TuiBadge,
    AsyncPipe,
    DarkmodeComponent,
    RouterLinkActive,
    PlanbadgeComponent,
    UserMenuDropdownComponent,
  ],
  templateUrl: './topnav.component.html',
  styleUrl: './topnav.component.scss',
})
export class TopnavComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('navContainer') navContainerRef!: ElementRef<HTMLElement>;

  isAuthenticated$: Observable<any>;
  userState$!: Observable<UserState>;
  user!: User;
  tienda!: Tienda;
  userMenuOpen = false;
  mobileMenuOpen = false;
  overflowMenuOpen = false;
  loadingAuthenticated$: Observable<any>;
  authState$ = this.store.pipe(select(selectAuth));
  URL_BASE = URL_BASE;

  open = this.sidebarService.open;

  visibleItems: NavItem[] = [];
  hiddenItems: NavItem[] = [];
  filteredItems: NavItem[] = [];

  // Dropdown state
  activeDropdownItem: NavItem | null = null;
  dropdownPosition = { x: 0, y: 0 };
  private leaveTimeout: any = null;

  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver | null = null;

  allNavItems: NavItem[] = [
    {
      route: '/app',
      label: 'Estadisticas',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      exact: true,
      accent: '#007AFF',
      subItems: [
        { route: '/app#general', label: 'General', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', description: 'Vista general del negocio' },
        { route: '/app#resumen', label: 'Resumen del Día', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', description: 'Ventas y métricas de hoy' },
        { route: '/app#inventario', label: 'Inventario y Alertas', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', description: 'Stock bajo y alertas' },
        { route: '/app#comparaciones', label: 'Comparaciones', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', description: 'Rendimiento y tendencias' },
      ],
    },
    {
      route: '/app/productos',
      label: 'Productos',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      accent: '#FF9500',
      subItems: [
        { route: '/app/productos#productos', label: 'Productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', description: 'Catálogo completo' },
        { route: '/app/productos#categorias', label: 'Categorías', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z', description: 'Organizar por categoría' },
        { route: '/app/productos#graficos', label: 'Gráficos', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', description: 'Visualización de datos' },
        { route: '/app/productos#barras', label: 'Imprimir Cód. Barras', icon: 'M3 5h2v14H3V5zm4 0h1v14H7V5zm3 0h1v14h-1V5zm3 0h2v14h-2V5zm4 0h2v14h-2V5z', description: 'Imprimir etiquetas térmicas' },
      ],
    },
    {
      route: '/app/ventas',
      label: 'Ventas',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      exact: true,
      accent: '#34C759',
      subItems: [
        { route: '/app/ventas#historial', label: 'Historial de Ventas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', description: 'Todas las ventas realizadas' },
        { route: '/app/ventas#ventas-hoy', label: 'Ventas Hoy', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', description: 'Detalle de ventas del día' },
        { route: '/app/ventas#anuladas-hoy', label: 'Ventas Anuladas Hoy', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', description: 'Ventas canceladas del día' },
      ],
    },
    {
      route: '/app/ventas/crear',
      label: 'Vender',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      accent: '#FF2D55',
      subItems: [
        { route: '/app/ventas/crear#normal', label: 'Venta normal', icon: 'M13 10V3L4 14h7v7l9-11h-7z', description: 'Punto de venta directo' },
        { route: '/app/ventas/crear#pedido', label: 'Venta pedido', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', description: 'Vender desde pedido existente' },
      ],
    },
    {
      route: '/app/clientes',
      label: 'Mis clientes',
      accent: '#AF52DE',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      subItems: [
        { route: '/app/clientes#mis-clientes', label: 'Clientes Registrados', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', description: 'Todos los clientes' },
        { route: '/app/clientes#estadisticas', label: 'Estadísticas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', description: 'Datos de clientes' },
        { route: '/app/clientes#sorteos', label: 'Sorteos', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7', description: 'Ganadores y sorteos' },
      ],
    },
    {
      route: '/app/compras',
      label: 'Compras',
      accent: '#5856D6',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      subItems: [
        { route: '/app/compras#historial', label: 'Historial de Compras', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', description: 'Todas las compras registradas' },
        { route: '/app/compras#comprobantes', label: 'Registrar Comprobantes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', description: 'Crear comprobante de compra' },
        { route: '/app/compras#proveedores', label: 'Proveedores', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', description: 'Todos los proveedores' },
      ],
    },
    {
      route: '/app/pedidos',
      label: 'Pedidos',
      accent: '#FF9F0A',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      subItems: [
        { route: '/app/pedidos#historial', label: 'Historial de Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', description: 'Todos los pedidos realizados' },
        { route: '/app/pedidos#crear', label: 'Crear Pedido', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', description: 'Registrar nuevo pedido' },
      ],
    },
    {
      route: '/app/ganancias',
      label: 'Ganancias',
      accent: '#00A8B5',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      subItems: [
        { route: '/app/ganancias', label: 'Resumen de Ganancias', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', description: 'Utilidad por rango de fechas' },
      ],
    },
    {
      route: '/app/tiendas',
      label: 'Tiendas',
      accent: '#8E8E93',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      superuserOnly: true,
      subItems: [
        { route: '/app/tiendas', label: 'Mis Tiendas', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', description: 'Gestionar tiendas' },
      ],
    },
  ];

  constructor(
    private store: Store<AppState>,
    public router: Router,
    public sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    public featureFlags: FeatureFlagsService,
    private logoutService: LogoutService
  ) {
    this.isAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.isAuthenticated)
    );
    this.loadingAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.loadingCheckAuthenticated)
    );
    this.userState$ = this.store.select(selectUsersState);

    effect(() => {
      if (this.navContainerRef?.nativeElement) {
        this.calculateVisibleItems();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    this.userState$.pipe(takeUntil(this.destroy$)).subscribe(userState => {
      this.user = userState.user;
      this.tienda = userState.user.tienda_data ?? ({} as Tienda);
      this.calculateVisibleItems();
    });
  }

  ngAfterViewInit() {
    if (this.navContainerRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateVisibleItems();
        this.activeDropdownItem = null;
      });
      this.resizeObserver.observe(this.navContainerRef.nativeElement);
    }
    this.calculateVisibleItems();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.resizeObserver?.disconnect();
    clearTimeout(this.leaveTimeout);
  }

  calculateVisibleItems() {
    const container = this.navContainerRef?.nativeElement;
    if (!container) return;

    this.filteredItems = this.allNavItems.filter(item => {
      if (item.superuserOnly && !this.user?.is_superuser) return false;
      if (item.featureFlag === 'tiktok' && !this.featureFlags.tiktokEnabled()) return false;
      return true;
    });

    const containerWidth = container.clientWidth;
    const moreButtonWidth = 72;

    let totalWidth = 0;
    const visible: NavItem[] = [];
    const hidden: NavItem[] = [];

    for (const item of this.filteredItems) {
      const itemWidth = item.label.length * 8 + 48;
      if (totalWidth + itemWidth <= containerWidth - moreButtonWidth) {
        visible.push(item);
        totalWidth += itemWidth;
      } else {
        hidden.push(item);
      }
    }

    if (hidden.length === 0 && visible.length > 0) {
      const lastItem = visible[visible.length - 1];
      const lastWidth = lastItem.label.length * 8 + 48;
      if (totalWidth + lastWidth > containerWidth) {
        hidden.unshift(visible.pop()!);
      }
    }

    this.visibleItems = visible;
    this.hiddenItems = hidden;
    this.cdr.detectChanges();
  }

  toggleItemDropdown(event: MouseEvent, item: NavItem) {
    event.preventDefault();
    event.stopPropagation();
    if (this.activeDropdownItem?.label === item.label) {
      this.activeDropdownItem = null;
    } else {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const dropdownWidth = 280;
      const dropdownHeight = item.subItems ? item.subItems.length * 56 + 60 : 200;
      let x = rect.left;
      let y = rect.bottom + 4;
      if (x + dropdownWidth > window.innerWidth) {
        x = window.innerWidth - dropdownWidth - 16;
      }
      if (y + dropdownHeight > window.innerHeight) {
        y = rect.top - dropdownHeight - 4;
      }
      this.dropdownPosition = { x, y };
      this.activeDropdownItem = item;
    }
  }

  onDropdownEnter() {
    clearTimeout(this.leaveTimeout);
  }

  onDropdownLeave() {
    this.leaveTimeout = setTimeout(() => {
      this.activeDropdownItem = null;
    }, 200);
  }

  navigateTo(route: string) {
    const [path, fragment] = route.split('#');
    this.router.navigate([path], { fragment: fragment || undefined });
    this.activeDropdownItem = null;
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    this.overflowMenuOpen = false;
  }

  toggleOverflowMenu() {
    this.overflowMenuOpen = !this.overflowMenuOpen;
  }

  closeOverflowMenu() {
    this.overflowMenuOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.userMenuOpen = false;
    }
    if (!target.closest('.mobile-menu-container')) {
      this.mobileMenuOpen = false;
    }
    if (!target.closest('.overflow-menu-container')) {
      this.overflowMenuOpen = false;
    }
    if (!target.closest('.nav-item-dropdown-container') && !target.closest('.overflow-menu-container') && !target.closest('.item-dropdown')) {
      this.activeDropdownItem = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    this.overflowMenuOpen = false;
    this.activeDropdownItem = null;
  }

  logout() {
    this.mobileMenuOpen = false;
    this.logoutService.logout();
  }

  logout2() {
    this.mobileMenuOpen = false;
    this.logoutService.logout();
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  /** Fondo suave translúcido a partir del acento (elegante en claro y oscuro). */
  soft(hex?: string): string {
    return hex ? hex + '1A' : '';
  }

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
