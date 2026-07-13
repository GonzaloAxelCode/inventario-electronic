import { GuiaRemisionRemitente } from '@/app/models/guia-remision.models';
import { cargarGuias } from '@/app/state/actions/guia-remision.actions';
import { AppState } from '@/app/state/app.state';
import { ListaguiasComponent } from '@/app/components/guiaremisioncomponents/listaguias/listaguias.component';
import { FormguiaComponent } from '@/app/components/guiaremisioncomponents/formguia/formguia.component';
import { DetalleguiaComponent } from '@/app/components/guiaremisioncomponents/detalleguia/detalleguia.component';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { TuiFade, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiHeader, TuiNavigation, TuiSubheaderComponent } from '@taiga-ui/layout';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-guia-remision',
  standalone: true,
  imports: [
    CommonModule,
    TuiNavigation,
    TuiHeader,
    TuiSubheaderComponent,
    TuiTabs,
    TuiTab,
    TuiFade,
    TuiIcon,
    ListaguiasComponent,
    FormguiaComponent,
    DetalleguiaComponent,
  ],
  templateUrl: './guia-remision.component.html',
  styleUrls: ['./guia-remision.component.scss'],
})
export class GuiaRemisionComponent implements OnInit {

  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  validTabs = ['lista', 'registrar'] as const;
  activeTab: 'lista' | 'registrar' = 'lista';
  activeTabIndex = 0;

  guiaSeleccionada: GuiaRemisionRemitente | null = null;

  ngOnInit() {
    this.store.dispatch(cargarGuias({ page: 1, page_size: 10 }));

    const fragment = this.route.snapshot.fragment;
    if (fragment && this.isValidTab(fragment)) {
      this.activeTab = fragment as typeof this.activeTab;
      this.activeTabIndex = this.validTabs.indexOf(fragment as any);
    }
  }

  onTabChange(index: number) {
    const tab = this.validTabs[index];
    this.activeTab = tab;
    this.activeTabIndex = index;
    this.guiaSeleccionada = null;
    this.location.replaceState(`/app/guia-remision#${tab}`);
  }

  onVerDetalle(guia: GuiaRemisionRemitente) {
    this.guiaSeleccionada = guia;
  }

  onEditarGuia(guia: GuiaRemisionRemitente) {
    this.guiaSeleccionada = guia;
    this.activeTab = 'registrar';
    this.activeTabIndex = 1;
  }

  onCerrarDetalle() {
    this.guiaSeleccionada = null;
    this.store.dispatch(cargarGuias({ page: 1, page_size: 10 }));
  }

  onCancelarForm() {
    this.guiaSeleccionada = null;
    this.activeTab = 'lista';
    this.activeTabIndex = 0;
    this.location.replaceState('/app/guia-remision#lista');
  }

  private isValidTab(tab: string): boolean {
    return this.validTabs.includes(tab as any);
  }
}
