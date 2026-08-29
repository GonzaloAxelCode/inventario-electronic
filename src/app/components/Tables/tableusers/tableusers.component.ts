import { User } from '@/app/models/user.models';
import { DialogCreateUserService } from '@/app/services/dialogs-services/dialog-create-user.service';
import { DialogEditUserPermissionService } from '@/app/services/dialogs-services/dialog-edit-user-permissions.service';
import { DialogUpdatePasswordService } from '@/app/services/dialogs-services/dialog-update-password-user.service';
import { desactivateUserAction, loadUsersAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { UserState } from '@/app/state/reducers/user.reducer';
import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiSkeleton, TuiSwitch } from '@taiga-ui/kit';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-tableusers',
  standalone: true,

  imports: [TuiSkeleton, TuiTable, CommonModule, TuiLoader, TuiBadge, TuiTable, TuiDataList, TuiSwitch, FormsModule, TuiAppearance, TuiButton, TuiIcon, TuiSkeleton, TuiAvatar, TuiBadge],
  templateUrl: './tableusers.component.html',

  styleUrl: './tableusers.component.scss'
})
export class TableUsersComponent implements OnInit {
  userState$?: Observable<UserState>;
  users!: User[]
  @Input() idtienda: number = 0
  openDropdownIndex: number | null = null;

  currentUser: User | null = null;
  isAdminTienda = false;

  loadingUpdateUser: boolean = true;
  loadingUsers: boolean = true;
  toggleDropdown(event: Event, index: number): void {
    event.stopPropagation();
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }

  closeDropdown(): void {
    this.openDropdownIndex = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.closeDropdown();
  }

  onDeleteUser(id: number): void {
    // Tu lógica para eliminar usuario
  }
  private readonly dialogServiceEditPermissions = inject(DialogEditUserPermissionService);
  private readonly dialogServiceUpdatepassowrd = inject(DialogUpdatePasswordService);
  private readonly dialogServiceCreateuser = inject(DialogCreateUserService);


  constructor(private store: Store<AppState>) {

  }
  ngOnInit() {

    this.store.dispatch(loadUsersAction({ idTienda: this.idtienda }))
    this.store.select(selectUsersState).pipe(
      tap((userState: UserState) => {
        this.users = userState.users;
        this.loadingUpdateUser = userState.loadingActivateUser;
        this.loadingUsers = userState.loadingUsers;
      })
    ).subscribe();

    this.store.select(selectCurrenttUser).pipe(
      tap(user => {
        this.currentUser = user as User | null;
        const u: any = user as any;
        this.isAdminTienda = !!u && !u.is_superuser && u.es_propietario === true;
      })
    ).subscribe();
  }

  isSelf(user: User): boolean {
    return !!this.currentUser && this.currentUser.id === user.id;
  }

  isSelfAdminTienda(user: User): boolean {
    return this.isAdminTienda && this.isSelf(user);
  }

  get filteredUsers(): User[] {
    if (!this.users) return [];
    if (!this.currentUser) return this.users;
    return this.users.filter(u => u.id !== this.currentUser!.id);
  }

  // Modal eliminar — solo visual, sin funcionalidad
  showDeleteConfirm = false;
  userToDelete: User | null = null;

  openDeleteConfirm(user: User): void {
    if (user.is_superuser || this.isSelfAdminTienda(user)) return;
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    // Solo cierra modal — sin dispatch, sin funcionalidad por ahora
    this.closeDeleteConfirm();
  }


  protected showDialogUpdatePassword(user: User): void {
    this.dialogServiceUpdatepassowrd.open(user).subscribe({

    });
  }

  protected showDialogEditPermissions(user: User): void {
    if (this.isSelfAdminTienda(user)) return;
    this.dialogServiceEditPermissions.open(user).subscribe({

    });
  }
  protected showDialogCreateUser(idtienda: number): void {
    this.dialogServiceCreateuser.open(idtienda).subscribe({

    });
  }
  toggleUpdateStateUser(event: Event, user: Partial<User>) {
    if (user.is_superuser) {
      event.preventDefault();
      return;
    }
    if (this.isSelfAdminTienda(user as User)) {
      event.preventDefault();
      return;
    }
    const updatedState = !user.is_active;

    this.store.dispatch(desactivateUserAction({
      id: user.id,
      is_active: updatedState
    }))


  }
}
