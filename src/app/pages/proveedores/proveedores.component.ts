import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import {
  TuiHeader,
  TuiNavigation,
  TuiSubheaderComponent
} from '@taiga-ui/layout';

import {
  TuiFade,
  TuiTab,
  TuiTabs,
} from '@taiga-ui/kit';

import { TuiIcon } from '@taiga-ui/core';
import { AppState } from '@/app/state/app.state';
import { loadProveedores } from '@/app/state/actions/proveedor.actions';
import { ListallproveedoresComponent } from '@/app/components/proveedorescomponents/listallproveedores/listallproveedores.component';
import { RegistrarproveedorComponent } from '@/app/components/proveedorescomponents/registrarproveedor/registrarproveedor.component';

@Component({
  selector: 'app-proveedores',
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
    ListallproveedoresComponent,
    RegistrarproveedorComponent,
  ],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {

  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  validTabs = ['listado', 'registrar'] as const;
  activeTab: 'listado' | 'registrar' = 'listado';
  activeTabIndex = 0;

  ngOnInit() {
    this.store.dispatch(loadProveedores());

    this.route.fragment.subscribe((fragment) => {
      if (fragment && this.isValidTab(fragment)) {
        this.activeTab = fragment as typeof this.activeTab;
        this.activeTabIndex = this.validTabs.indexOf(fragment as any);
        this.cdr.markForCheck();
      }
    });
  }

  onTabChange(index: number) {
    const tab = this.validTabs[index];
    this.activeTab = tab;
    this.activeTabIndex = index;
    this.location.replaceState(`/app/proveedores#${tab}`);
  }

  private isValidTab(tab: string): boolean {
    return (this.validTabs as readonly string[]).includes(tab);
  }
}
