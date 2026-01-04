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
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
  TuiTitle
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnInit {
  isAuthenticated$: Observable<any>;
  userState$!: Observable<UserState>;
  user!: User
  tienda!: Tienda

  constructor(private store: Store<AppState>, public router: Router, public sidebarService: SidebarService) {

    this.isAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.isAuthenticated)
    );


    this.loadingAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.loadingCheckAuthenticated)
    );
    this.userState$ = this.store.select(selectUsersState);


  }

  loadingAuthenticated$: Observable<any>;
  authState$ = this.store.pipe(select(selectAuth));

  logout() {

    this.store.dispatch(clearTokensAction())

    this.store.dispatch(clearUserAction())
    this.onClose();
    this.router.navigate(['/login']);
  }
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  protected readonly dialogs = inject(TuiDialogService);


  open = this.sidebarService.open
  public onClose(): void {
    this.open.set(false);

  }

  logout2() {
    this.store.dispatch(clearTokensAction())
    this.store.dispatch(clearUserAction())
    this.store.dispatch(clearInventariosFromCache())
    this.onClose()
    this.router.navigate(['/login']);

  }

  //user menu 

  protected readonly itemsMenuUser = ['Edit', 'Download', 'Rename', 'Delete'];

  protected openMenuUser = false;

  protected onClickMenuUser(): void {
    this.openMenuUser = false;
  }
  URL_BASE = URL_BASE

  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;
      this.tienda = userState.user.tienda_data ?? {} as Tienda
    });
  }
  isopenSidebar = this.sidebarService.open
  openSidebar() {

    this.open.set(true);
  }

}
