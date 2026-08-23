import { DialogcompradetailComponent } from '@/app/components/Dialogs/dialogcompradetail/dialogcompradetail.component';
import { ComprobanteCompra } from '@/app/models/compra.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogCompraDetailService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: ComprobanteCompra): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogcompradetailComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: "auto",
            data,
        };
        return this.dialogService.open(component, options);
    }
}
