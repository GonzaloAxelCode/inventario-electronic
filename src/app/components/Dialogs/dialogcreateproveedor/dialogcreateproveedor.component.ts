import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { FormproveedorComponent } from "../../Forms/formproveedor/formproveedor.component";
@Component({
  selector: 'app-dialogcreateproveedor',
  standalone: true,
  imports: [FormproveedorComponent],
  templateUrl: './dialogcreateproveedor.component.html',
  styleUrl: './dialogcreateproveedor.component.scss'
})
export class DialogcreateproveedorComponent {
  protected readonly context = injectContext<TuiDialogContext<any>>();
  cerrarDialogo() {
    this.context.completeWith(true);
  }
}
