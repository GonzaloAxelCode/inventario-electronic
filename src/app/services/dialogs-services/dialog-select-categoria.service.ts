import { Categoria } from '@/app/models/categoria.models';
import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialogselectcategoriaComponent } from '@/app/components/Dialogs/dialogselectcategoria/dialogselectcategoria.component';

@Injectable({
  providedIn: 'root',
})
export class DialogSelectCategoriaService {
  private readonly dialogService = inject(TuiDialogService);

  open(categorias: Categoria[], seleccionadaId?: number | null): Observable<Categoria | null | undefined> {
    const component = new PolymorpheusComponent(DialogselectcategoriaComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: 'm',
      label: 'Seleccionar categoría',
      data: { categorias, seleccionadaId },
    };
    return this.dialogService.open<Categoria | null | undefined>(component, options);
  }
}
