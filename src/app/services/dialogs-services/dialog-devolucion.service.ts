
import { DialogdevolucionComponent } from '@/app/components/Dialogs/dialogdevolucion/dialogdevolucion.component';
import { inject, Injectable } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DialogDevolucionService {
  private readonly dialogService = inject(TuiDialogService);
  /**
   import { inject, Injectable } from '@angular/core';
import {TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
   */
  open(): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogdevolucionComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: "l",
      label: "Crear un ",
    };

    return this.dialogService.open(component, options);
  }
  constructor() { }
}
