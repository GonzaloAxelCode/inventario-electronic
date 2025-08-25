import { Tienda } from '@/app/models/tienda.models';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TableUsersComponent } from '../../Tables/tableusers/tableusers.component';
@Component({
  selector: 'app-dialogdetailtienda',
  standalone: true,
  imports: [TableUsersComponent, CommonModule],
  templateUrl: './dialogdetailtienda.component.html',
  styleUrl: './dialogdetailtienda.component.scss'
})
export class DialogdetailtiendaComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Tienda>>>();
  public tienda: Partial<Tienda> = this.context.data ?? {};
}
