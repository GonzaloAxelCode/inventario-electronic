import { User } from '@/app/models/user.models';
import { DialogCreateUserService } from '@/app/services/dialogs-services/dialog-create-user.service';
import { DialogEditUserPermissionService } from '@/app/services/dialogs-services/dialog-edit-user-permissions.service';
import { DialogUpdatePasswordService } from '@/app/services/dialogs-services/dialog-update-password-user.service';
import { desactivateUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider } from '@taiga-ui/kit';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-usermanagement',
  standalone: true,
  imports: [TuiTable, CommonModule, TuiTable, TuiSwitch, FormsModule, TuiAppearance, TuiButton, TuiIcon],
  templateUrl: './usermanagement.component.html',
  styleUrl: './usermanagement.component.scss',
  providers: [tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' }),]
})
export class UsermanagementComponent {
  userState$?: Observable<UserState>;
  users: User[] = []
  private readonly dialogServiceEditPermissions = inject(DialogEditUserPermissionService);
  private readonly dialogServiceUpdatepassowrd = inject(DialogUpdatePasswordService);
  private readonly dialogServiceCreateuser = inject(DialogCreateUserService);


  constructor(private store: Store<AppState>) {

  }
  ngOnInit() {
    this.store.select(selectUsersState).pipe(
      tap(userState => {
        this.users = userState.users;
        console.log(userState.users)

      })
    ).subscribe();

  }


  protected showDialogUpdatePassword(user: User): void {
    this.dialogServiceUpdatepassowrd.open(user).subscribe({

    });
  }

  protected showDialogEditPermissions(user: User): void {
    this.dialogServiceEditPermissions.open(user).subscribe({

    });
  }
  protected showDialogCreateUser(): void {
    this.dialogServiceCreateuser.open().subscribe({

    });
  }
  toggleUpdateStateUser(event: Event, user: Partial<User>) {
    const updatedState = !user.is_active;

    console.log("Cambiado a ", !user.is_active)


    this.store.dispatch(desactivateUserAction({
      id: user.id,
      is_active: updatedState
    }))


  }
}
