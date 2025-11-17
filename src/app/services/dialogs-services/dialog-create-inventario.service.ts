import { DialogcreateinventarioComponent } from '@/app/components/Dialogs/dialogcreateinventario/dialogcreateinventario.component';
import { Producto } from '@/app/models/producto.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogCreateInventarioService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Producto): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogcreateinventarioComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: "l",
            data,
            label: "Hacer inventario para " + data.nombre,
        };

        return this.dialogService.open(component, options);
    }
}
