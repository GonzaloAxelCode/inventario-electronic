import { Injectable, inject } from '@angular/core';
import { TuiDialogService, TuiDialogOptions } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialoglivedetailComponent, Live } from '../../components/Dialogs/dialoglivedetail/dialoglivedetail.component';

@Injectable({ providedIn: 'root' })
export class DialogLiveService {
  private readonly dialogService = inject(TuiDialogService);

  open(live: Live): Observable<boolean> {
    const component = new PolymorpheusComponent(DialoglivedetailComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: 'page',
      label: '',
      data: live,
    };
    return this.dialogService.open(component, options);
  }
}
