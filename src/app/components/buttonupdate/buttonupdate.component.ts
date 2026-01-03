import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TUI_FALSE_HANDLER } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { map, startWith, Subject, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-buttonupdate',
  standalone: true,
  imports: [CommonModule, AsyncPipe, TuiButton, TuiButtonLoading],
  templateUrl: './buttonupdate.component.html',
  styleUrl: './buttonupdate.component.scss'
})
export class ButtonupdateComponent {
  protected readonly trigger$ = new Subject<void>();


  protected readonly loading$ = this.trigger$.pipe(
    switchMap(() => timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))),
  );

  @Input() func!: () => void;
  @Input() loading: any = false
  @Input() vertical: boolean = true
  @Input() text: string = 'Refresh'

  protected onClick() {
    if (this.func) {
      this.func();   // ejecuta función del padre
    }
  }
}
