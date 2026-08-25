import { DialogpedidodetailComponent } from '@/app/components/Dialogs/dialogpedidodetail/dialogpedidodetail.component';
import { Pedido } from '@/app/models/pedido.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogPedidoDetailService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Pedido): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogpedidodetailComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: "l",
            data,
        };
        return this.dialogService.open(component, options);
    }
}
