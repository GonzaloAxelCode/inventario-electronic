
import { Proveedor } from '@/app/models/proveedor.models';
import { updateProveedorAction } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDialogContext, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogupdateproveedor',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextfield,
    TuiButton],
  templateUrl: './dialogupdateproveedor.component.html',
  styleUrl: './dialogupdateproveedor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class DialogupdateproveedorComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Proveedor>>>();
  public proveedor: Partial<Proveedor> = this.context.data ?? {};

  proveedorForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    this.proveedorForm = this.fb.group({
      nombre: [this.proveedor.nombre, Validators.required],
      direccion: [this.proveedor.direccion, Validators.required],
      telefono: [this.proveedor.telefono, [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
      tipo_producto: [this.proveedor.tipo_producto, Validators.required]
    });
  }
  userPermissions$ = this.store.select(selectPermissions);
  ngOnInit(): void {
    this.proveedorForm.get('nombre')?.disable();
    this.proveedorForm.get('tipo_producto')?.disable();
  }

  onCloseDialog() {
    this.context.completeWith(true);
  }

  onSubmit() {
    if (this.proveedorForm.valid) {
      const updatedProveedor = {
        ...this.proveedor,
        ...this.proveedorForm.value
      };
      this.store.dispatch(updateProveedorAction({ proveedor: updatedProveedor }));
      this.onCloseDialog();
    }
  }
}
