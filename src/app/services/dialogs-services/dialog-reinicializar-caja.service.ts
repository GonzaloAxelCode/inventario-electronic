
import { DialogreinicializarcajaComponent } from '@/app/components/Dialogs/dialogreinicializarcaja/dialogreinicializarcaja.component';
import { inject, Injectable } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DialogReinicializarCajaService {
  private readonly dialogService = inject(TuiDialogService);
  /**
   import { inject, Injectable } from '@angular/core';
import {TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
   */
  open(): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogreinicializarcajaComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: "s",
      label: "Reinicializar esta caja",
    };

    return this.dialogService.open(component, options);
  }
  constructor() { }
}
