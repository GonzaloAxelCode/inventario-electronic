import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialogupdatelogosComponent } from '@/app/components/Dialogs/dialogupdatelogos/dialogupdatelogos.component';
import { Tienda } from '@/app/models/tienda.models';

@Injectable({
  providedIn: 'root',
})
export class DialogUpdateLogosService {
  private readonly dialogService = inject(TuiDialogService);

  open(data: Tienda): Observable<Tienda | null> {
    const component = new PolymorpheusComponent(DialogupdatelogosComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: 'm',
      data,
      label: 'Logos de ' + (data.nombre || 'la tienda'),
    };

    return this.dialogService.open(component, options);
  }
}
