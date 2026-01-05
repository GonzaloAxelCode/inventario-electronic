import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-perfilsettings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfilsettings.component.html',
  styleUrl: './perfilsettings.component.scss'
})
export class PerfilsettingsComponent {
  userState$!: Observable<UserState>;
  user: User = initialStateUser.user;
  tienda!: Tienda
  constructor(private store: Store<AppState>) {

    this.userState$ = this.store.select(selectUsersState);
  }

  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;
      this.tienda = userState.user?.tienda_data || {} as Tienda
      console.log(this.user)
    });
  }
}
