import { DialogupdatecategoriaComponent } from '@/app/components/Dialogs/dialogupdatecategoria/dialogupdatecategoria.component';
import { Categoria } from '@/app/models/categoria.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root',
})
export class DialogUpdateCategoriaService {
    private readonly dialogService = inject(TuiDialogService);

    open(data: Partial<Categoria>): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogupdatecategoriaComponent);
        const options: Partial<any> = {
            dismissible: true,
            size: "auto",
            data,
            label: "Actualizar categoria"
        };

        return this.dialogService.open(component, options);
    }
}
