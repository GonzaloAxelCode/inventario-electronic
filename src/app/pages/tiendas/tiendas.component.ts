import { DialogcreatetiendaComponent } from '@/app/components/Dialogs/dialogcreatetienda/dialogcreatetienda.component';
import { TabletiendasComponent } from '@/app/components/Tables/tabletiendas/tabletiendas.component';
import { Component } from '@angular/core';
import { TuiAppearance, TuiButton, tuiDialog } from '@taiga-ui/core';
import { FormaddtiendaComponent } from "../../components/Forms/formaddtienda/formaddtienda.component";


@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [FormaddtiendaComponent, TabletiendasComponent, TuiButton, TuiAppearance],
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
        console.info(`Dialog emitted data = ${data}`);
      },
      complete: () => {
        console.info('Dialog closed');
      },
    });
  }

}
