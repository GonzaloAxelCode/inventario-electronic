import { Injectable, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialoglimitreachedComponent, LimiteAlcanzadoData } from '@/app/components/Dialogs/dialoglimitreached/dialoglimitreached.component';

@Injectable({
  providedIn: 'root',
})
export class DialogLimiteAlcanzadoService {
  private readonly dialogService = inject(TuiDialogService);

  open(data: LimiteAlcanzadoData): Observable<boolean> {
    const component = new PolymorpheusComponent(DialoglimitreachedComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: 's',
      data,
      label: 'Límite del plan',
    };

    return this.dialogService.open(component, options);
  }
}
