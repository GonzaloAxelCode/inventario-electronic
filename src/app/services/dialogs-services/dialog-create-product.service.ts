import { DialogcreateproductComponent } from '@/app/components/Dialogs/dialogcreateproduct/dialogcreateproduct.component';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogCreateProductService {
    private readonly dialogService = inject(TuiDialogService);

    open(): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogcreateproductComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: "l",
            label: "Crear un producto",
        };

        return this.dialogService.open(component, options);
    }
}
