import { SidebarService } from '@/app/services/ui/sidebar-service.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiIcon, TuiPopup, TuiTextfield, TuiTitle } from '@taiga-ui/core';

import { User } from '@/app/models/user.models';
import { clearTokensAction } from '@/app/state/actions/auth.actions';
import { clearUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiAvatar, TuiBadge, TuiDrawer, TuiPulse, TuiStatus } from '@taiga-ui/kit';
import { TuiCell, TuiNavigation, TuiSearch } from '@taiga-ui/layout';
import { Observable } from 'rxjs';
import ChoosestoreComponent from '../choosestore/choosestore.component';
import { DarkmodeComponent } from "../darkmode/darkmode.component";
import { ChartsalesbetweentwodatesComponent } from "../dashboardcomponents/chartsalesbetweentwodates/chartsalesbetweentwodates.component";



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, CommonModule,
    ReactiveFormsModule,
    TuiAvatar, RouterModule,
    TuiCell,
    TuiAppearance,
    TuiNavigation, TuiDropdown,
    TuiSearch, TuiButton,
    TuiTextfield, TuiPulse,
    TuiTitle, DarkmodeComponent, ChoosestoreComponent, ChartsalesbetweentwodatesComponent, TuiDrawer, TuiButton, TuiAppearance,
    TuiAvatar, TuiDataList, TuiStatus, TuiBadge,
    TuiPopup, TuiIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  userState$!: Observable<UserState>;
  user: User = initialStateUser.user;
  constructor(public sidebarService: SidebarService, private store: Store<AppState>, public router: Router) {

    this.userState$ = this.store.select(selectUsersState);
    this.userState$.subscribe(userState => {
      this.user = userState.user;

    });
  }
  open = this.sidebarService.open
  openSidebar() {

    this.open.set(true);
  }

  logout() {
    this.store.dispatch(clearTokensAction())
    this.store.dispatch(clearUserAction())

    this.router.navigate(['/login']);
  }
}
