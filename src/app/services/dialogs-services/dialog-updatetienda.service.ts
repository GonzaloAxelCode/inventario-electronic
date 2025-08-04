import { DialogupdattiendaComponent } from '@/app/components/Dialogs/dialogupdattienda/dialogupdattienda.component';
import { Injectable, inject } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root',
})
export class DialogUpdateTiendaService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<any>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogupdattiendaComponent);
        const options: Partial<any> = {
            dismissible: true,
            size: "auto",
            data
        };

        return this.dialogService.open(component, options);
    }
}
