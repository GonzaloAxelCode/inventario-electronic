import { DialogcreateproveedorComponent } from '@/app/components/Dialogs/dialogcreateproveedor/dialogcreateproveedor.component';
import { Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root',
})
export class DialogCreateProveedorService {

    constructor(
        private readonly dialogService: TuiDialogService,
        private readonly injector: Injector// Inyectar el Injector aquí
    ) { }
    open(): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogcreateproveedorComponent, this.injector);
        const options: Partial<any> = {
            label: 'Crear Proveedor',
            dismissible: true,
            size: "auto",

        };

        return this.dialogService.open(component, options);
    }
}
