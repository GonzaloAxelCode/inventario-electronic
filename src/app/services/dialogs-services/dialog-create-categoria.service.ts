import { DialogcreatecategoriaComponent } from '@/app/components/Dialogs/dialogcreatecategoria/dialogcreatecategoria.component';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DialogCreateCategoriaService {
    private readonly dialogService = inject(TuiDialogService);

    open(tiendaId?: number | string): Observable<boolean> {
        const component = new PolymorpheusComponent(DialogcreatecategoriaComponent);
        const options: Partial<TuiDialogOptions<any>> = {
            dismissible: true,
            size: "l",
            label: "Crear Nueva Categoria",
            data: tiendaId !== undefined && tiendaId !== null && tiendaId !== '' ? { tiendaId } : undefined,
        };

        return this.dialogService.open(component, options);
    }
}
