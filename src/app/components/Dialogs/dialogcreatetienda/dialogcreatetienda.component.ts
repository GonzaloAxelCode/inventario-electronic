import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { FormaddstoreComponent } from '../../Forms/formaddstore/formaddstore.component';

@Component({
  selector: 'app-dialogcreatetienda',
  standalone: true,
  imports: [FormaddstoreComponent],
  templateUrl: './dialogcreatetienda.component.html',
  styleUrl: './dialogcreatetienda.component.scss'
})
export class DialogcreatetiendaComponent {
  protected readonly context = injectContext<TuiDialogContext<void, void>>();

  close(): void {
    this.context.completeWith();
  }
}
