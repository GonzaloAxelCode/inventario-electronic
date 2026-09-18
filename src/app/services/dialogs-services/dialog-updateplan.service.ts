import { DialogupdateplanComponent } from '@/app/components/Dialogs/dialogupdateplan/dialogupdateplan.component';
import { PlanSuscripcion } from '@/app/models/tienda.models';
import { inject, Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogUpdatePlanService {
  private readonly dialogService = inject(TuiDialogService);

  open(plan: PlanSuscripcion): Observable<PlanSuscripcion | null> {
    const component = new PolymorpheusComponent(DialogupdateplanComponent);
    return this.dialogService.open(component, {
      dismissible: true,
      size: 'm',
      data: plan,
    });
  }
}
