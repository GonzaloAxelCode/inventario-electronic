import { DialogupdateproveedorComponent } from '@/app/components/Dialogs/dialogupdateproveedor/dialogupdateproveedor.component';
import { Proveedor } from '@/app/models/proveedor.models';
import { Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root',
})
export class DialogUpdateProveedorService {

    constructor(
        private readonly dialogService: TuiDialogService,
        private readonly injector: Injector// Inyectar el Injector aquí
    ) { }
    open(data: Partial<Proveedor>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogupdateproveedorComponent, this.injector);
        const options: Partial<any> = {
            label: 'Actualizar Proveedor',
            dismissible: true,
            size: "auto",
            data
        };

        return this.dialogService.open(component, options);
    }
}
