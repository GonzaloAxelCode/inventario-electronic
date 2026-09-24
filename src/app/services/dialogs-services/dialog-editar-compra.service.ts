import { DialogeditarcompraComponent } from '@/app/components/Dialogs/dialogeditarcompra/dialogeditarcompra.component';
import { ComprobanteCompra } from '@/app/models/compra.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogEditarCompraService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: ComprobanteCompra): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogeditarcompraComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: 'auto',
            data,
            appearance: 'lorem-ipsum',
        };
        return this.dialogService.open(component, options);
    }
}
