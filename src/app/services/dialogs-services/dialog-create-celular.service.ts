import { DialogcreatecelularComponent } from '@/app/components/Dialogs/dialogcreatecelular/dialogcreatecelular.component';
import { Injectable, Injector, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogCreateCelularService {
  private readonly dialogService = inject(TuiDialogService);
  private readonly injector = inject(Injector);
  open(): Observable<any> {
    const component = new PolymorpheusComponent(DialogcreatecelularComponent, this.injector);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      closeable: false,
      size: 'l',
      label: 'Agregar celular',
    };
    return this.dialogService.open(component, options);
  }
  openEdit(data: Record<string, unknown>): Observable<any> {
    const component = new PolymorpheusComponent(DialogcreatecelularComponent, this.injector);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      closeable: false,
      size: 'l',
      label: 'Editar celular',
      data,
    };
    return this.dialogService.open(component, options);
  }
}
