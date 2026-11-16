import { DialogcreaterepuestoComponent } from '@/app/components/Dialogs/dialogcreaterepuesto/dialogcreaterepuesto.component';
import { Injectable, Injector, inject } from '@angular/core';
import { TuiDialogOptions, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogCreateRepuestoService {
  private readonly dialogService = inject(TuiDialogService);
  private readonly injector = inject(Injector);
  open(): Observable<any> {
    const component = new PolymorpheusComponent(DialogcreaterepuestoComponent, this.injector);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      closeable: false,
      size: 'l',
      label: 'Agregar repuesto',
    };
    return this.dialogService.open(component, options);
  }
  openEdit(data: Record<string, unknown>): Observable<any> {
    const component = new PolymorpheusComponent(DialogcreaterepuestoComponent, this.injector);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      closeable: false,
      size: 'l',
      label: 'Editar repuesto',
      data,
    };
    return this.dialogService.open(component, options);
  }
}
