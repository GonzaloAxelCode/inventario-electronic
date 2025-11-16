import { DialogventadetailComponent } from '@/app/components/Dialogs/dialogventadetail/dialogventadetail.component';
import { Venta } from '@/app/models/venta.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

export interface VentaDialogOptions extends TuiDialogOptions<any> {
    data: Partial<Venta> | null;
}


@Injectable({
    providedIn: 'root',
})
export class DialogVentaDetailService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<Venta> | null): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogventadetailComponent);
        const options: Partial<VentaDialogOptions> = {
            dismissible: false,
            size: "auto",
            data,

        };

        return this.dialogService.open(component, options);
    }
}
