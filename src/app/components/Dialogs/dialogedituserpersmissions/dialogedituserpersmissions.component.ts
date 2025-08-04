import { User, UserPermissions } from '@/app/models/user.models';
import { updateUserPermissionsAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { userInitial } from '@/app/state/reducers/user.reducer';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiDialogContext } from '@taiga-ui/core';
import { TuiSwitch, tuiSwitchOptionsProvider } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
@Component({
  selector: 'app-dialogedituserpersmissions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiSwitch, FormsModule, TuiAppearance],
  templateUrl: './dialogedituserpersmissions.component.html',
  styleUrl: './dialogedituserpersmissions.component.scss',
  providers: [tuiSwitchOptionsProvider({ showIcons: true, appearance: () => 'neutral' }),]
})
export class DialogedituserpersmissionsComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<User>>>();
  public user: Partial<User> = this.context.data || userInitial

  public permissionsForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    this.permissionsForm = this.fb.group({

      can_make_sale: [this.user.permissions?.can_make_sale ?? false],
      can_cancel_sale: [this.user.permissions?.can_cancel_sale ?? false],
      view_sale: [this.user.permissions?.view_sale ?? false],


      can_create_inventory: [this.user.permissions?.can_create_inventory ?? false],
      can_modify_inventory: [this.user.permissions?.can_modify_inventory ?? false],
      can_update_inventory: [this.user.permissions?.can_update_inventory ?? false],
      can_delete_inventory: [this.user.permissions?.can_delete_inventory ?? false],
      view_inventory: [this.user.permissions?.view_inventory ?? false],


      can_create_product: [this.user.permissions?.can_create_product ?? false],
      can_update_product: [this.user.permissions?.can_update_product ?? false],
      can_delete_product: [this.user.permissions?.can_delete_product ?? false],
      view_product: [this.user.permissions?.view_product ?? false],


      can_create_category: [this.user.permissions?.can_create_category ?? false],
      can_modify_category: [this.user.permissions?.can_modify_category ?? false],
      can_delete_category: [this.user.permissions?.can_delete_category ?? false],
      view_category: [this.user.permissions?.view_category ?? false],


      can_create_supplier: [this.user.permissions?.can_create_supplier ?? false],
      can_modify_supplier: [this.user.permissions?.can_modify_supplier ?? false],
      can_delete_supplier: [this.user.permissions?.can_delete_supplier ?? false],
      view_supplier: [this.user.permissions?.view_supplier ?? false],


      can_create_store: [this.user.permissions?.can_create_store ?? false],
      can_modify_store: [this.user.permissions?.can_modify_store ?? false],
      can_delete_store: [this.user.permissions?.can_delete_store ?? false],
      view_store: [this.user.permissions?.view_store ?? false],
    });
    console.log(this.user)
  }


  ngOnInit(): void {

    this.permissionsForm.valueChanges.subscribe((permissions) => {
      this.updatePermissions(permissions);
    });
  }

  private updatePermissions(permissions: Partial<UserPermissions>): void {
    console.log(permissions)
    this.store.dispatch(
      updateUserPermissionsAction({
        id: this.user.id,
        permissions: permissions,
      })
    );
  }
}
