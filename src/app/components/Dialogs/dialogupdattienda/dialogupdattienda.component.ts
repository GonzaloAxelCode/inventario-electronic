import { Tienda } from '@/app/models/tienda.models';
import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
@Component({
  selector: 'app-dialogupdattienda',
  standalone: true,
  imports: [],
  templateUrl: './dialogupdattienda.component.html',
  styleUrl: './dialogupdattienda.component.scss'
})
export class DialogupdattiendaComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Tienda>>>();
  public tienda: Partial<Tienda> = this.context.data ?? {};
}
