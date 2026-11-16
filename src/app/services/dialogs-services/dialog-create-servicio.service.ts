import { DialogcreateservicioComponent } from '@/app/components/Dialogs/dialogcreateservicio/dialogcreateservicio.component';
import { Injectable, Injector, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogCreateServicioService {
  private readonly dialogService = inject(TuiDialogService);
  private readonly injector = inject(Injector);
  open(): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogcreateservicioComponent, this.injector);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      closeable: false,
      size: 'l',
      label: 'Agregar servicio',
    };
    return this.dialogService.open(component, options);
  }
  openEdit(data: Record<string, unknown>): Observable<boolean> {
    const component = new PolymorpheusComponent(DialogcreateservicioComponent, this.injector);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      closeable: false,
      size: 'l',
      label: 'Editar servicio',
      data,
    };
    return this.dialogService.open(component, options);
  }
}
