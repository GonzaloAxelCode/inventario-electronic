import { PlanbadgeComponent } from '@/app/components/planbadge/planbadge.component';
import { Tienda } from '@/app/models/tienda.models';
import { faltanteSunat, isSunatConfigurado } from '@/app/utils/sunat-status';
import { AppState } from '@/app/state/app.state';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-suscripcionsettings',
  standalone: true,
  imports: [CommonModule, PlanbadgeComponent],
  templateUrl: './suscripcionsettings.component.html',
  styleUrl: './suscripcionsettings.component.scss',
})
export class SuscripcionsettingsComponent implements OnInit {
  tiendaId: number | null = null;
  tienda: Tienda = {} as Tienda;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.select(selectUsersState).subscribe((userState) => {
      const td = (userState.user as any)?.tienda_data as Tienda | undefined;
      this.tienda = td || ({} as Tienda);
      this.tiendaId = td?.id ?? (userState.user as any)?.tienda ?? null;
    });
  }

  get sunatOK(): boolean {
    return isSunatConfigurado(this.tienda);
  }

  get numPersonal(): number | null {
    const n = this.tienda?.users_tienda?.length ?? this.tienda?.tienda_stats?.num_personal;
    return n == null ? null : Number(n);
  }

  get numProductos(): number | null {
    const n = this.tienda?.tienda_stats?.num_productos;
    return n == null ? null : Number(n);
  }

  get sunatFaltante(): string {
    const faltan = faltanteSunat(this.tienda);
    return faltan.length ? 'Falta: ' + faltan.join(' + ') : '';
  }
}
