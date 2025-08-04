
import { DialogrealizarprestamoComponent } from '@/app/components/Dialogs/dialogrealizarprestamo/dialogrealizarprestamo.component';
import { inject, Injectable } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DialogRealizarPrestamoService {

  constructor() { }
  private readonly dialogService = inject(TuiDialogService);
  /**
   import { inject, Injectable } from '@angular/core';
import {TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
   */
  open(): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogrealizarprestamoComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: "s",
      label: "Hacer un prestamo",
    };

    return this.dialogService.open(component, options);
  }
}
