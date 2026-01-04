




import { User } from '@/app/models/user.models';
import { SidebarService } from '@/app/services/ui/sidebar-service.service';
import { clearTokensAction } from '@/app/state/actions/auth.actions';
import { clearInventariosFromCache } from '@/app/state/actions/inventario.actions';
import { clearUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectAuth } from '@/app/state/selectors/auth.selectors';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  TuiTextfield
} from '@taiga-ui/core';
import {
  TuiAvatar,
  TuiAvatarLabeled,
  TuiButtonLoading,
  TuiDrawer,
  TuiTabs
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { map, Observable } from 'rxjs';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-sidenavadmin',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, RouterModule,
    FormsModule,
    NgIf,
    TuiDataList,
    TuiDropdown,
    TuiNavigation, TuiButtonLoading,
    TuiTabs, TuiAvatarLabeled, TuiFallbackSrcPipe,
    TuiTextfield, RouterLinkActive, RouterLinkWithHref, TuiIcon, HeaderComponent,
    TuiDropdownMobile,
    TuiDrawer, TuiButton, TuiAppearance,
    TuiAvatar,
    TuiPopup, TuiIcon
  ],
  templateUrl: './sidenavadmin.component.html',
  styleUrl: './sidenavadmin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavadminComponent implements OnInit {
  isAuthenticated$: Observable<any>;
  userState$!: Observable<UserState>;
  user: User = initialStateUser.user;


  constructor(private store: Store<AppState>, public router: Router, public sidebarService: SidebarService) {

    this.isAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.isAuthenticated)
    );
    this.userState$ = this.store.select(selectUsersState);

    this.loadingAuthenticated$ = this.store.select(selectAuth).pipe(
      map(authState => authState.loadingCheckAuthenticated)
    );
  }

  loadingAuthenticated$: Observable<any>;
  authState$ = this.store.pipe(select(selectAuth));
  loadingLogout = false;
  logout2() {
    this.loadingLogout = true;

    setTimeout(() => {
      this.store.dispatch(clearTokensAction())
      this.store.dispatch(clearUserAction())
      this.store.dispatch(clearInventariosFromCache())
      this.onClose()
      this.router.navigate(['/login']);
    }, 3000);
  }
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
  protected readonly dialogs = inject(TuiDialogService);


  open = this.sidebarService.open
  public onClose(): void {
    this.open.set(false);

  }

  protected readonly itemsMenuUser = ['Edit', 'Download', 'Rename', 'Delete'];

  protected openMenuUser = false;

  protected onClickMenuUser(): void {
    this.openMenuUser = false;
  }
  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;

    });
  }


}
