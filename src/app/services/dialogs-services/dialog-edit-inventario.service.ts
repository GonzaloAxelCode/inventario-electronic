import { DialogeditinventarioComponent } from '@/app/components/Dialogs/dialogeditinventario/dialogeditinventario.component';
import { Inventario } from '@/app/models/inventario.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

export interface InventarioDialogOptions extends TuiDialogOptions<any> {
    data: Partial<Inventario>;
}

@Injectable({
    providedIn: 'root',
})
export class DialogEditInventarioDetailService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<Inventario>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogeditinventarioComponent);
        const options: Partial<InventarioDialogOptions> = {
            dismissible: true,
            size: "auto",
            data
        };

        return this.dialogService.open(component, options);
    }
}
