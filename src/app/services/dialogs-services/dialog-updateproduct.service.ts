import { DialogupdateproductComponent } from '@/app/components/Dialogs/dialogupdateproduct/dialogupdateproduct.component';
import { Producto } from '@/app/models/producto.models';
import { Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root',
})
export class DialogUpdateProductService {

    constructor(
        private readonly dialogService: TuiDialogService,
        private readonly injector: Injector // Inyectar el Injector aquí
    ) { }
    open(data: Partial<Producto>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogupdateproductComponent, this.injector);
        const options: Partial<any> = {
            dismissible: true,
            size: "l",
            data,
            label: "Actualizar un producto"
        };

        return this.dialogService.open(component, options);
    }
}
