import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';

@Component({
  selector: 'app-buttonupdate',
  standalone: true,
  imports: [CommonModule, AsyncPipe, TuiButton, TuiButtonLoading],
  templateUrl: './buttonupdate.component.html',
  styleUrl: './buttonupdate.component.scss',
})
export class ButtonupdateComponent {

  @Input({ required: true }) func!: () => void;

  @Input() loading = false;
  @Input() text = 'Refresh';
  @Input() vertical = true;

  protected onClick(): void {
    if (!this.loading) {
      this.func();
    }
  }
}
