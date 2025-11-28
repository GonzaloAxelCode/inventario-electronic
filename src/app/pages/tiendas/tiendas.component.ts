import { DialogcreatetiendaComponent } from '@/app/components/Dialogs/dialogcreatetienda/dialogcreatetienda.component';
import { FormaddstoreComponent } from '@/app/components/Forms/formaddstore/formaddstore.component';
import { TabletiendasComponent } from '@/app/components/Tables/tabletiendas/tabletiendas.component';
import { Component } from '@angular/core';
import { TuiAppearance, TuiButton, tuiDialog } from '@taiga-ui/core';



@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [FormaddstoreComponent, TabletiendasComponent, TuiButton, TuiAppearance],
  templateUrl: './tiendas.component.html',
  styleUrl: './tiendas.component.scss'
})
export class TiendasComponent {
  private readonly dialog = tuiDialog(DialogcreatetiendaComponent, {
    dismissible: true,
    label: 'Nuevo Tienda',
    size: "l"
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
