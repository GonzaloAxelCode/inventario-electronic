import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { LiveSummary } from '../../../services/dialogs-services/dialog-live-summary.service';

@Component({
  selector: 'app-dialoglivesummary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialoglivesummary.component.html',
  styleUrl: './dialoglivesummary.component.scss',
})
export class DialoglivesummaryComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, LiveSummary>>();
  public live: LiveSummary = this.context.data;
}
