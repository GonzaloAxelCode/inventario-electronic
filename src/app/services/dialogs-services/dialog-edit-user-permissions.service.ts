
import { DialogedituserpersmissionsComponent } from '@/app/components/Dialogs/dialogedituserpersmissions/dialogedituserpersmissions.component';
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
export class DialogEditUserPermissionService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<User>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogedituserpersmissionsComponent);
        const options: Partial<UserDialogOptions> = {
            dismissible: true,
            size: "auto",
            data,
            label: "Permisos para " + data.first_name
        };

        return this.dialogService.open(component, options);
    }
}
