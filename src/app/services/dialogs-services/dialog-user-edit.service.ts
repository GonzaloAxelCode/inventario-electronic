import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialogusereditComponent } from '@/app/components/Dialogs/dialoguseredit/dialoguseredit.component';
import { User } from '@/app/models/user.models';

@Injectable({
  providedIn: 'root',
})
export class DialogUserEditService {
  private readonly dialogService = inject(TuiDialogService);

  open(data: User): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogusereditComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: 's',
      data,
      label: 'Editar personal',
    };

    return this.dialogService.open(component, options);
  }
}
