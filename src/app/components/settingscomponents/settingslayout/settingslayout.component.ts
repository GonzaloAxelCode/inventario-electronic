import { User } from '@/app/models/user.models';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiRepeatTimes } from '@taiga-ui/cdk';
import {
  TuiAppearance, TuiButton, TuiGroup,
  TuiIcon,
  TuiLink,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiBlock, TuiBreadcrumbs, TuiFade, TuiTabs, TuiTabsWithMore } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-settingslayout',
  standalone: true,
  imports: [CommonModule, RouterModule, TuiTabsWithMore, TuiButton, NgIf,
    TuiAppearance,
    TuiBadge,
    TuiBlock,
    TuiBreadcrumbs, NgIf,
    TuiButton,
    TuiCardLarge,
    TuiFade,
    TuiGroup,
    TuiHeader,
    TuiIcon,
    TuiLink,
    TuiNavigation,
    TuiRepeatTimes,
    TuiTabs,
    TuiTextfield,
    TuiTitle, TuiIcon, TuiAvatar],
  templateUrl: './settingslayout.component.html',
  styleUrl: './settingslayout.component.scss'
})
export class SettingslayoutComponent {

  userState$!: Observable<UserState>;
  user: User = initialStateUser.user;

  constructor(private store: Store<AppState>) {

    this.userState$ = this.store.select(selectUsersState);
  }

  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;

    });
  }

}
