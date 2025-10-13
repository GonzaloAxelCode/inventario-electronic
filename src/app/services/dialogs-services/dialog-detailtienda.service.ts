import { DialogdetailtiendaComponent } from '@/app/components/Dialogs/dialogdetailtienda/dialogdetailtienda.component';
import { Injectable, inject } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root',
})
export class DialogDetailTiendaService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<any>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogdetailtiendaComponent);
        const options: Partial<any> = {
            dismissible: true,

            size: "l",
            data
        };

        return this.dialogService.open(component, options);
    }
}
