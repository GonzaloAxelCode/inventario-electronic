import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialoguseractionsComponent, UserActionData, UserActionResult } from '@/app/components/Dialogs/dialoguseractions/dialoguseractions.component';

@Injectable({
  providedIn: 'root',
})
export class DialogUserActionsService {
  private readonly dialogService = inject(TuiDialogService);

  open(data: UserActionData): Observable<UserActionResult> {
    const component = new PolymorpheusComponent(DialoguseractionsComponent);
    const options: Partial<TuiDialogOptions<UserActionData>> = {
      dismissible: true,
      size: 's',
      data,
      label: data.user.username,
    };

    return this.dialogService.open(component, options);
  }
}
