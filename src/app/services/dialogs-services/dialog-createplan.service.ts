import { DialogcreateplanComponent } from '@/app/components/Dialogs/dialogcreateplan/dialogcreateplan.component';
import { PlanSuscripcion } from '@/app/models/tienda.models';
import { inject, Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogCreatePlanService {
  private readonly dialogService = inject(TuiDialogService);

  open(): Observable<PlanSuscripcion | null> {
    const component = new PolymorpheusComponent(DialogcreateplanComponent);
    return this.dialogService.open(component, {
      dismissible: true,
      size: 'm',
    });
  }
}
