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
  ],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {

  private store = inject(Store<AppState>);

  ngOnInit() {
    this.store.dispatch(loadProveedores());
  }
}
