import { DialogupdatepasswordComponent } from '@/app/components/Dialogs/dialogupdatepassword/dialogupdatepassword.component';
import { User } from '@/app/models/user.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

interface UserDialogOptions extends TuiDialogOptions<any> {
    data: Partial<User>;
}

@Injectable({
    providedIn: 'root',
})
export class DialogUpdatePasswordService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<User>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogupdatepasswordComponent);
        const options: Partial<UserDialogOptions> = {
            dismissible: true,
            size: "m",
            data,
            label: "Cambiar Password"
        };

        return this.dialogService.open(component, options);
    }
}
