import { Component } from '@angular/core';
import { FormproveedorComponent } from "../../components/Forms/formproveedor/formproveedor.component";
import { TableproveedorComponent } from "../../components/Tables/tableproveedor/tableproveedor.component";

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [TableproveedorComponent, FormproveedorComponent],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent {

}
