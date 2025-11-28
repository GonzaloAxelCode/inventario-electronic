
import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { selectInventarioState } from '@/app/state/selectors/inventario.selectors';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiFormatNumberPipe } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { TuiBlockDetails } from '@taiga-ui/layout';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-low-stock',
  standalone: true,
  imports: [CommonModule, TuiBlockDetails, AsyncPipe, TuiFormatNumberPipe, TuiTable, TuiSkeleton],

  templateUrl: './dashboard-low-stock.component.html',
  styleUrl: './dashboard-low-stock.component.scss',

})
export class DashboardLowStockComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  selectInventario$!: Observable<InventarioState>
  tiendaUser!: number
  constructor() {
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });

  }
  ngOnInit() {

    this.selectInventario$ = this.store.select(selectInventarioState);
    this.store.select(selectInventarioState).subscribe((state) => {

    })

  }
  getColorClass(cantidad: number): string {
    if (cantidad >= 0 && cantidad <= 3) {
      return 'text-red-500';
    } else if (cantidad >= 4 && cantidad <= 10) {
      return 'text-yellow-400';
    } else {
      return 'text-green-400';
    }
  }
}
