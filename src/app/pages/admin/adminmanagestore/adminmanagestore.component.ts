import { DialogcreatetiendaComponent } from '@/app/components/Dialogs/dialogcreatetienda/dialogcreatetienda.component';
import { FormaddstoreComponent } from '@/app/components/Forms/formaddstore/formaddstore.component';
import { TabletiendasComponent } from '@/app/components/Tables/tabletiendas/tabletiendas.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiAppearance, TuiButton, TuiIcon, tuiDialog, TuiTitle } from '@taiga-ui/core';
import { TuiSkeleton, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';

@Component({
  selector: 'app-adminmanagestore',
  standalone: true,
  imports: [
    CommonModule,
    FormaddstoreComponent,
    TabletiendasComponent,
    TuiButton,
    TuiAppearance,
    TuiSkeleton,
    TuiTab,
    TuiTabs,
    TuiHeader,
    TuiNavigation,
    TuiTitle,
    TuiIcon
  ],
  templateUrl: './adminmanagestore.component.html',
  styleUrl: './adminmanagestore.component.scss'
})
export class AdminmanagestoreComponent {
  activeTab: 'gestion' | 'reportes' | 'configuracion' = 'gestion';

  private readonly dialog = tuiDialog(DialogcreatetiendaComponent, {
    dismissible: true,
    label: 'Nueva Tienda',
    size: "l"
  });

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  protected showDialog(): void {
    this.dialog().subscribe({
      next: (data) => {},
      complete: () => {},
    });
  }
}
