import { User } from '@/app/models/user.models';
import { PERMISSION_GROUPS } from '@/app/models/permissions.catalog';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-permisossettings',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './permisossettings.component.html',
  styleUrl: './permisossettings.component.scss',
})
export class PermisossettingsComponent implements OnInit {
  userState$?: Observable<UserState>;
  user: User = initialStateUser.user;
  groups = PERMISSION_GROUPS;

  constructor(private store: Store<AppState>) {
    this.userState$ = this.store.select(selectUsersState);
  }

  ngOnInit() {
    this.userState$?.subscribe(userState => {
      this.user = userState.user;
    });
  }

  tiene(key: string): boolean {
    return !!(this.user?.permissions as any)?.[key];
  }
}
