import { User } from '@/app/models/user.models';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider } from '@taiga-ui/kit';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-permisossettings',
  standalone: true,
  imports: [CommonModule, TuiSwitch, FormsModule, TuiAppearance],
  templateUrl: './permisossettings.component.html',
  styleUrl: './permisossettings.component.scss',
  providers: [
    tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' }),
  ],
})
export class PermisossettingsComponent {
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
