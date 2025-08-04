
import { DialogcerrarcajaComponent } from '@/app/components/Dialogs/dialogcerrarcaja/dialogcerrarcaja.component';
import { inject, Injectable } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DialogCerrarCajaService {
  private readonly dialogService = inject(TuiDialogService);
  /**
   import { inject, Injectable } from '@angular/core';
import {TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
   */
  open(): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogcerrarcajaComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: "s",
      label: "Cerrar Caja",
    };

    return this.dialogService.open(component, options);
  }
  constructor() { }
}
