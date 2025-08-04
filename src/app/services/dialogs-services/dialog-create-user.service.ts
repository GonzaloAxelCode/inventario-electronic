import { DialogcreateuserComponent } from '@/app/components/Dialogs/dialogcreateuser/dialogcreateuser.component';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogCreateUserService {
    private readonly dialogService = inject(TuiDialogService);

    open(): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogcreateuserComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: "m",
            label: "Crear Nuevo Personal",
        };

        return this.dialogService.open(component, options);
    }
}
