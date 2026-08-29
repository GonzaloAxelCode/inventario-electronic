import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { getLoginUserDataFromLocalStorage } from '@/app/services/utils/localstorage-functions';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-myaccount',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './myaccount.component.html',
  styleUrl: './myaccount.component.scss'
})
export class MyaccountComponent implements OnInit {
  userState$!: Observable<UserState>;
  user: User = initialStateUser.user;
  tienda!: Tienda;

  constructor(private store: Store<AppState>, private router: Router) {
    this.userState$ = this.store.select(selectUsersState);
  }

  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;
      this.tienda = userState.user?.tienda_data || {} as Tienda;
    });
  }

  get fullName(): string {
    return [this.user.first_name, this.user.last_name].filter(Boolean).join(' ') || 'Sin nombre';
  }

  get initials(): string {
    return `${this.user.first_name?.charAt(0) || 'U'}${this.user.last_name?.charAt(0) || ''}`;
  }

  get roleLabel(): string {
    if (this.user.is_superuser) return 'Administrador';
    if (this.user.is_staff) return 'Staff';
    return 'Personal';
  }

  get activePermissionsCount(): number {
    if (!this.user?.permissions) return 0;
    return Object.values(this.user.permissions).filter(Boolean).length;
  }

  get accountAgeDays(): number {
    if (!this.user.date_joined) return 0;
    const joined = new Date(this.user.date_joined).getTime();
    return Math.max(0, Math.floor((Date.now() - joined) / 86400000));
  }
}
