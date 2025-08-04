
import { DialogaperturacajaComponent } from '@/app/components/Dialogs/dialogaperturacaja/dialogaperturacaja.component';
import { inject, Injectable } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DialogAperturaCajaService {

  constructor() { }

  private readonly dialogService = inject(TuiDialogService);
  /**
   import { inject, Injectable } from '@angular/core';
import {TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
   */
  open(): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogaperturacajaComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: "l",
      label: "Crear un ",
    };

    return this.dialogService.open(component, options);
  }
}
