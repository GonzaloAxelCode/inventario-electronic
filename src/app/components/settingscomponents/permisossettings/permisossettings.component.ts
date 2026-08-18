import { User } from '@/app/models/user.models';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { AsyncPipe, CommonModule, KeyValuePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiAmountPipe } from '@taiga-ui/addon-commerce';
import { TuiAppearance, TuiButton, TuiExpand, TuiTitle } from '@taiga-ui/core';
import { TuiAccordion, TuiAccordionItem, TuiAccordionItemContent, TuiAvatar } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-permisossettings',
  standalone: true,
  imports: [CommonModule, TuiAppearance, TuiAccordion, TuiExpand,

    AsyncPipe,
    KeyValuePipe,
    TuiAccordionItem,
    TuiAccordionItemContent,

    TuiAccordion,
    TuiAmountPipe,
    TuiAvatar,
    TuiButton,
    TuiCell,
    TuiTitle
  ],
  templateUrl: './permisossettings.component.html',
  styleUrl: './permisossettings.component.scss',
})
export class PermisossettingsComponent implements OnInit {
  userState$?: Observable<UserState>;
  user: User = initialStateUser.user;

  constructor(private store: Store<AppState>) {
    this.userState$ = this.store.select(selectUsersState);
  }

  ngOnInit() {
    this.userState$?.subscribe(userState => {
      this.user = userState.user;

    });
  }
}
