import { User } from '@/app/models/user.models';
import { PERMISSION_GROUPS } from '@/app/models/permissions.catalog';
import { updateUserAction, updateUserPermissionsAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
@Component({
  selector: 'app-dialogedituserpersmissions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiSwitch, FormsModule, TuiAppearance, TuiLoader],
  templateUrl: './dialogedituserpersmissions.component.html',
  styleUrl: './dialogedituserpersmissions.component.scss',
  providers: [tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' }),]
})
export class DialogedituserpersmissionsComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, User>>();
  public user: User = this.context.data

  public permissionsForm: FormGroup;
  loaderUpdatePermission: boolean = false
  isSuperUser = false;
  isTargetAdminTienda = false;
  loadingAdminToggle = false;

  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    const controls: Record<string, any> = {};
    for (const group of PERMISSION_GROUPS) {
      for (const item of group.items) {
        controls[item.key] = [(this.user.permissions as any)?.[item.key] ?? false];
      }
    }
    this.permissionsForm = this.fb.group(controls);
  }

  ngOnInit() {
    this.store.select(selectUsersState).subscribe((state) => {
      this.loaderUpdatePermission = state.loadingUpdatePermissions;
      this.loadingAdminToggle = (state as any).loadingUpdateUser || false;
    })

    this.store.select(selectCurrenttUser).subscribe(u => {
      const cur: any = u as any;
      this.isSuperUser = !!cur?.is_superuser;
    });

    this.isTargetAdminTienda = !!(this.user as any)?.es_propietario;

    //aca escuchar el reducer si fue eliminado exitosamente para cerrar el dialog escucha el action 
  }
  permissionSections = PERMISSION_GROUPS.map((g) => ({
    title: g.titulo,
    items: g.items.map((i) => ({ name: i.key, label: i.label })),
  }));


  onPermissionChange(permissionKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.checked;



    this.store.dispatch(
      updateUserPermissionsAction({
        id: this.user.id,
        permiso: permissionKey,
        valor: value,
      })
    );
  }

  onAdminTiendaToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.checked;
    this.isTargetAdminTienda = value;
    this.store.dispatch(updateUserAction({ user: { id: this.user.id, es_propietario: value } as any }));
  }

}
