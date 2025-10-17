import { User } from '@/app/models/user.models';
import { updateUserPermissionsAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
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
  protected readonly context = injectContext<TuiDialogContext<boolean, User>>();
  public user: User = this.context.data

  public permissionsForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    this.permissionsForm = this.fb.group({

      // 🛒 Ventas
      can_make_sale: [this.user.permissions?.can_make_sale ?? false],
      can_cancel_sale: [this.user.permissions?.can_cancel_sale ?? false],


      // 📦 Inventario
      can_create_inventory: [this.user.permissions?.can_create_inventory ?? false],
      can_modify_inventory: [this.user.permissions?.can_modify_inventory ?? false],

      can_delete_inventory: [this.user.permissions?.can_delete_inventory ?? false],


      // 🧴 Productos
      can_create_product: [this.user.permissions?.can_create_product ?? false],
      can_update_product: [this.user.permissions?.can_update_product ?? false],
      can_delete_product: [this.user.permissions?.can_delete_product ?? false],


      // 🏷️ Categorías
      can_create_category: [this.user.permissions?.can_create_category ?? false],
      can_modify_category: [this.user.permissions?.can_modify_category ?? false],
      can_delete_category: [this.user.permissions?.can_delete_category ?? false],


      // 🚚 Proveedores
      can_create_proveedor: [this.user.permissions?.can_create_proveedor ?? false],
      can_update_proveedor: [this.user.permissions?.can_update_proveedor ?? false],
      can_delete_proveedor: [this.user.permissions?.can_delete_proveedor ?? false],


    });

    console.log(this.user)
  }
  permissionSections = [
    {
      title: 'Ventas',
      items: [
        { name: 'can_make_sale', label: 'Puede hacer una venta' },
        { name: 'can_cancel_sale', label: 'Puede cancelar una venta' },
      ],
    },
    {
      title: 'Inventario',
      items: [
        { name: 'can_create_inventory', label: 'Puede crear inventario' },
        { name: 'can_modify_inventory', label: 'Puede modificar inventario' },
        { name: 'can_delete_inventory', label: 'Puede eliminar inventario' },
      ],
    },
    {
      title: 'Productos',
      items: [
        { name: 'can_create_product', label: 'Puede crear productos' },
        { name: 'can_update_product', label: 'Puede modificar productos' },
        { name: 'can_delete_product', label: 'Puede eliminar productos' },
      ],
    },
    {
      title: 'Categorías',
      items: [
        { name: 'can_create_category', label: 'Puede crear categorías' },
        { name: 'can_modify_category', label: 'Puede modificar categorías' },
        { name: 'can_delete_category', label: 'Puede eliminar categorías' },
      ],
    },
    {
      title: 'Proveedores',
      items: [
        { name: 'can_create_proveedor', label: 'Puede crear proveedores' },
        { name: 'can_update_proveedor', label: 'Puede modificar proveedores' },
        { name: 'can_delete_proveedor', label: 'Puede eliminar proveedores' },
      ],
    },
  ];


  onPermissionChange(permissionKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.checked;

    console.log(`Actualizando ${permissionKey}:`, value);

    this.store.dispatch(
      updateUserPermissionsAction({
        id: this.user.id,
        permiso: permissionKey,
        valor: value,
      })
    );
  }


}
