
import { DialogselectproductsComponent } from '@/app/components/Dialogs/dialogselectproducts/dialogselectproducts.component';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    private readonly dialogService = inject(TuiDialogService);

    open(): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogselectproductsComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: "auto",
            label: "Stock de productos",
        };

        return this.dialogService.open(component, options);
    }
}
