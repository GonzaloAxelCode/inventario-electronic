
import { DialogregistraringresoComponent } from '@/app/components/Dialogs/dialogregistraringreso/dialogregistraringreso.component';
import { inject, Injectable } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DialogRegistrarIngresoService {
  private readonly dialogService = inject(TuiDialogService);
  /**
   import { inject, Injectable } from '@angular/core';
import {TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
   */
  open(): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogregistraringresoComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: "s",
      label: "Hacer ingreso de efectivo",
    };

    return this.dialogService.open(component, options);
  }
  constructor() { }
}
