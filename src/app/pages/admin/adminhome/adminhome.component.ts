import { User } from '@/app/models/user.models';
import { loadUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';

@Component({
  selector: 'app-adminhome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './adminhome.component.html',
  styleUrl: './adminhome.component.scss'
})
export class AdminhomeComponent implements OnInit {
  user$: Observable<User | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  constructor(private store: Store<AppState>) {
    const userState$ = this.store.select(selectUsersState);
    this.user$ = userState$.pipe(map(s => s.user ?? null));
    this.loading$ = userState$.pipe(map(s => !!s.loadingCurrentUser));
    this.error$ = userState$.pipe(map(s => s.errors));
  }

  ngOnInit(): void {
    this.store.select(selectUsersState).pipe(take(1)).subscribe(state => {
      if (!state.user && !state.loadingCurrentUser) {
        this.store.dispatch(loadUserAction());
      }
    });
  }

  reload(): void {
    this.store.dispatch(loadUserAction());
  }

  getInitials(user: User | null): string {
    if (!user) return 'U';
    const a = user.first_name?.charAt(0) || '';
    const b = user.last_name?.charAt(0) || '';
    if (a || b) return (a + b).toUpperCase();
    return (user.username?.charAt(0) || 'U').toUpperCase();
  }
}
