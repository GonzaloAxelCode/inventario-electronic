import { DialogcreatetiendaComponent } from '@/app/components/Dialogs/dialogcreatetienda/dialogcreatetienda.component';
import { FormaddstoreComponent } from '@/app/components/Forms/formaddstore/formaddstore.component';
import { TabletiendasComponent } from '@/app/components/Tables/tabletiendas/tabletiendas.component';
import { Component } from '@angular/core';
import { TuiAppearance, TuiButton, tuiDialog } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';



@Component({
  selector: 'app-adminmanagestore',
  standalone: true, imports: [FormaddstoreComponent, TabletiendasComponent, TuiButton, TuiAppearance, TuiSkeleton],
  templateUrl: './adminmanagestore.component.html',
  styleUrl: './adminmanagestore.component.scss'
})
export class AdminmanagestoreComponent {
  private readonly dialog = tuiDialog(DialogcreatetiendaComponent, {
    dismissible: true,
    label: 'Nueva Tienda',
    size: "s"
  });
  protected showDialog(): void {
    this.dialog().subscribe({
      next: (data) => {

      },
      complete: () => {

      },
    });
  }

}
