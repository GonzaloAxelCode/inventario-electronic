import { Injectable, inject } from '@angular/core';
import { TuiDialogService, TuiDialogOptions } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { DialoglivesummaryComponent } from '../../components/Dialogs/dialoglivesummary/dialoglivesummary.component';

export interface LiveSummary {
  titulo: string;
  fecha: string;
  hora: string;
  duracion: string;
  espectadores: number;
  ventas: number;
  ingresos: number;
}

@Injectable({ providedIn: 'root' })
export class DialogLiveSummaryService {
  private readonly dialogService = inject(TuiDialogService);

  open(live: LiveSummary): Observable<boolean> {
    const component = new PolymorpheusComponent(DialoglivesummaryComponent);
    const options: Partial<TuiDialogOptions<any>> = {
      dismissible: true,
      size: 's',
      label: 'Resumen del Live',
      data: live,
    };
    return this.dialogService.open(component, options);
  }
}
