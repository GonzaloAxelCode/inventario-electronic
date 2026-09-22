import { User } from '@/app/models/user.models';
import { findTiendaById, getLimitePersonal, getUsoPersonal, limitePersonalAlcanzado, Tienda } from '@/app/models/tienda.models';
import { DialogCreateUserService } from '@/app/services/dialogs-services/dialog-create-user.service';
import { DialogLimiteAlcanzadoService } from '@/app/services/dialogs-services/dialog-limite-alcanzado.service';
import { DialogEditUserPermissionService } from '@/app/services/dialogs-services/dialog-edit-user-permissions.service';
import { DialogUpdatePasswordService } from '@/app/services/dialogs-services/dialog-update-password-user.service';
import { DialogUserActionsService } from '@/app/services/dialogs-services/dialog-user-actions.service';
import { DialogUserEditService } from '@/app/services/dialogs-services/dialog-user-edit.service';
import { DialogUserResetPasswordService } from '@/app/services/dialogs-services/dialog-user-reset-password.service';
import { UserService } from '@/app/services/user.service';
import { TiendaService } from '@/app/services/tienda.service';
import { desactivateUserAction, loadUsersAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { UserState } from '@/app/state/reducers/user.reducer';
import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  deletedUsers: User[] = []
  @Input() idtienda: number = 0
  openDropdownIndex: number | null = null;

  currentUser: User | null = null;
  isAdminTienda = false;
  isSuperUser = false;

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
  private readonly dialogUserActions = inject(DialogUserActionsService);
  private readonly dialogUserEdit = inject(DialogUserEditService);
  private readonly dialogUserResetPassword = inject(DialogUserResetPasswordService);
  private readonly tiendaService = inject(TiendaService);
  private readonly dialogLimiteAlcanzado = inject(DialogLimiteAlcanzadoService);
  private readonly router = inject(Router);

  // Límite de personal del plan y uso actual
  planLimitePersonal: number | null = null;
  private planLimitsLoadedForTienda: number | null = null;
  tiendaActual: Tienda | null = null;


  constructor(
    private store: Store<AppState>,
    private userService: UserService
  ) {

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

    // Tienda actual (incluye anidadas) para el límite del plan
    this.store.select(selectTiendaState).pipe(
      tap(tiendaState => {
        this.tiendaActual = findTiendaById(tiendaState.tiendas, Number(this.idtienda));
      })
    ).subscribe();

    this.store.select(selectCurrenttUser).pipe(
      tap(user => {
        this.currentUser = user as User | null;
        const u: any = user as any;
        this.isAdminTienda = !!u && !u.is_superuser && u.es_propietario === true;
        this.isSuperUser = !!u?.is_superuser;
        if (this.isSuperUser) {
          this.loadDeletedUsers();
        }
      })
    ).subscribe();

    // Límite de personal del plan: si se alcanzó, crear abre el modal de límite
    const tiendaId = Number(this.idtienda);
    if (tiendaId && this.planLimitsLoadedForTienda !== tiendaId) {
      this.planLimitsLoadedForTienda = tiendaId;
      this.tiendaService.getPlanYSuscripcion(tiendaId).subscribe({
        next: (data) => {
          const v: any = (data?.plan_actual as any)?.limite_personal;
          this.planLimitePersonal = v ?? null;
        },
        error: () => {
          this.planLimitsLoadedForTienda = null;
        },
      });
    }
  }

  loadDeletedUsers(): void {
    this.userService.getDeletedUsers(this.idtienda).subscribe({
      next: (users) => {
        this.deletedUsers = users;
      },
      error: (error) => {
        console.error('Error al cargar usuarios eliminados:', error);
      }
    });
  }

  isSelf(user: User): boolean {
    return !!this.currentUser && this.currentUser.id === user.id;
  }

  isSelfAdminTienda(user: User): boolean {
    return this.isAdminTienda && this.isSelf(user);
  }

  isUserDeleted(user: User | null): boolean {
    return !!user && !!(user as any).is_deleted;
  }

  get filteredUsers(): User[] {
    if (!this.users) return [];
    if (!this.currentUser) return this.users;
    let allUsers = [...this.users];
    if (this.isSuperUser && this.deletedUsers.length > 0) {
      const existingIds = new Set(this.users.map(u => u.id));
      const newDeletedUsers = this.deletedUsers.filter(u => !existingIds.has(u.id));
      allUsers = [...allUsers, ...newDeletedUsers];
    }
    return allUsers.filter(u => u.id !== this.currentUser!.id);
  }

  // Modal acciones del personal (Taiga UI)
  openUserActions(user: User): void {
    this.dialogUserActions.open({
      user,
      isSuperUser: this.isSuperUser,
      isSelfAdmin: this.isSelfAdminTienda(user),
      isDeleted: this.isUserDeleted(user),
    }).subscribe((action) => {
      if (!action) return;
      switch (action) {
        case 'edit':
          this.openEditUserDialog(user);
          break;
        case 'password':
          this.openResetPasswordDialog(user);
          break;
        case 'permissions':
          this.showDialogEditPermissions(user);
          break;
        case 'delete':
          this.openDeleteConfirm(user);
          break;
      }
    });
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

  // Editar personal (Taiga UI)
  openEditUserDialog(user: User): void {
    this.dialogUserEdit.open(user).subscribe((ok) => {
      if (ok) {
        this.store.dispatch(loadUsersAction({ idTienda: this.idtienda }));
      }
    });
  }

  // Cambiar contraseña (Taiga UI)
  openResetPasswordDialog(user: User): void {
    this.dialogUserResetPassword.open(user).subscribe();
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    const userId = this.userToDelete.id;
    const isCurrentlyDeleted = (this.userToDelete as any).is_deleted;

    this.userService.toggleUserDeleted(userId, !isCurrentlyDeleted).subscribe({
      next: (response) => {
        this.store.dispatch(loadUsersAction({ idTienda: this.idtienda }));
        this.closeDeleteConfirm();
      },
      error: (error) => {
        console.error('Error al eliminar/restaurar usuario:', error);
        this.closeDeleteConfirm();
      }
    });
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
    // Límite del plan: prefiere subscripcion_data/stats de la tienda; fallback al endpoint de planes
    const usoFallback = this.users?.length ?? 0;
    const limite = getLimitePersonal(this.tiendaActual) ?? this.planLimitePersonal;
    const uso = this.tiendaActual ? getUsoPersonal(this.tiendaActual, usoFallback) : usoFallback;
    if (limite != null && Number(limite) < 999999 && uso >= Number(limite)) {
      this.dialogLimiteAlcanzado.open({
        tipo: 'Personal',
        usados: uso,
        limite: Number(limite),
        diasRestantes: null,
        fechaReset: null,
      }).subscribe((verPlan) => {
        if (verPlan) this.router.navigate(['/app/settings/suscripcion']);
      });
      return;
    }
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
