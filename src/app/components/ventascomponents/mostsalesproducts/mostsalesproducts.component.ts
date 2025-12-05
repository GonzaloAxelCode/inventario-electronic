

import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectVentaState } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiAxes, TuiLineDaysChart } from '@taiga-ui/addon-charts';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiBlock, TuiChip, TuiDataListWrapper, TuiFade, TuiItemsWithMore, TuiPagination, TuiSkeleton, TuiStatus, TuiTab, TuiTabs, TuiTabsWithMore, TuiTile } from '@taiga-ui/kit';
import { TuiAppBar, TuiBlockDetails, TuiBlockStatus, TuiHeader, TuiNavigation, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiInputDateRangeModule, TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { Observable } from 'rxjs';

import * as dayjs from 'dayjs';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
//@ts-ignore
dayjs.extend(advancedFormat);    //@ts-ignore
dayjs.extend(localizedFormat);
dayjs.locale('es');
@Component({
  selector: 'app-mostsalesproducts',
  standalone: true,
  imports: [
    AsyncPipe, TuiItemsWithMore, TuiAppearance,
    CommonModule, TuiTabsWithMore,
    TuiIcon,
    TuiBlockStatus, TuiBlockDetails, TuiBlock, TuiTile,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    RouterLink,
    TuiAppBar,
    TuiAppearance,
    TuiBadge,

    TuiBlockStatus,
    TuiButton,
    TuiTab,
    TuiChip, TuiSkeleton,
    TuiDataList,
    TuiDataListWrapper,
    TuiDropdown,

    TuiInputDateModule,
    TuiInputDateRangeModule,
    TuiInputModule,

    TuiLoader,

    TuiSearch,

    TuiSelectModule,
    TuiStatus,

    TuiTable,
    TuiTextareaModule,
    TuiTextfield,
    TuiTextfieldControllerModule,

    TuiButton,
    TuiAppearance,
    TuiTable,
    TuiFade,
    TuiNavigation, TuiHeader, TuiTabs,
    AsyncPipe,
    FormsModule,
    NgIf,
    TuiAxes,
    TuiInputDateRangeModule,
    TuiLineDaysChart, TuiPagination],
  templateUrl: './mostsalesproducts.component.html',
  styleUrl: './mostsalesproducts.component.scss'
})
export class MostsalesproductsComponent {
  ventasState$!: Observable<Partial<VentaState>>;
  ventas: any = []
  data: any

  tiendaUser!: number

  constructor(private fb: FormBuilder, private store: Store<AppState>) {

  }
  ngOnInit() {

    this.ventasState$ = this.store.select(selectVentaState);
    this.ventasState$.subscribe(ventas => {

      this.data = ventas.topProductoMostSales


    });
  }

}
