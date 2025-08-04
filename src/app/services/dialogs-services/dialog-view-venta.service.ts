import { DialogventadetailComponent } from '@/app/components/Dialogs/dialogventadetail/dialogventadetail.component';
import { Inventario } from '@/app/models/inventario.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root',
})
export class DialogVentaDetailService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<Inventario>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogventadetailComponent);
        const options: Partial<any> = {
            dismissible: true,
            size: "auto",
            data
        };

        return this.dialogService.open(component, options);
    }
}
