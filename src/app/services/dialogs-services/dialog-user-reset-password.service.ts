import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialoguserresetpasswordComponent } from '@/app/components/Dialogs/dialoguserresetpassword/dialoguserresetpassword.component';
import { User } from '@/app/models/user.models';

@Injectable({
  providedIn: 'root',
})
export class DialogUserResetPasswordService {
  private readonly dialogService = inject(TuiDialogService);

  open(data: User): Observable<boolean> {
    const component = new PolymorpheusComponent(DialoguserresetpasswordComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: 's',
      data,
      label: 'Cambiar contraseña',
    };

    return this.dialogService.open(component, options);
  }
}
