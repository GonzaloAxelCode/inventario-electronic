import { Tienda, findTiendaById } from '@/app/models/tienda.models';
import { imageUrl } from '@/app/services/utils/endpoints';
import { faltanteSunat, isSunatConfigurado } from '@/app/utils/sunat-status';
import { AppState } from '@/app/state/app.state';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-mitiendasettings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mitiendasettings.component.html',
  styleUrl: './mitiendasettings.component.scss',
})
export class MitiendasettingsComponent implements OnInit {
  tienda: Tienda = {} as Tienda;
  tiendasEstado: Tienda[] = [];
  imageUrl = imageUrl;

  /** Username del propietario (objeto nuevo o legacy). */
  get propietarioUsername(): string {
    const p: any = (this.tienda as any)?.propietario;
    if (p != null && typeof p === 'object') return p.username || p.full_name || '';
    const pd: any = (this.tienda as any)?.propietario_data;
    return pd?.username || '';
  }

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.select(selectUsersState).subscribe((userState) => {
      this.tienda = ((userState.user as any)?.tienda_data as Tienda) || ({} as Tienda);
    });
    this.store.select(selectTiendaState).subscribe((tiendaState) => {
      this.tiendasEstado = tiendaState.tiendas ?? [];
    });
  }

  /** Tienda completa del estado (con suscripción y stats); fallback a tienda_data. */
  get tiendaCompleta(): any {
    const id = (this.tienda as any)?.id;
    return (id != null && findTiendaById(this.tiendasEstado, id)) || this.tienda;
  }

  /** Límite de personal del plan como "usados/límite". */
  get limitePersonalTexto(): string {
    const t: any = this.tiendaCompleta;
    const limite = t?.subscripcion_data?.limite_personal;
    if (limite == null) return '—';
    const usados = t?.tienda_stats?.num_personal ?? t?.users_tienda?.length ?? 0;
    return `${usados}/${limite}`;
  }

  get sunatOK(): boolean {
    return isSunatConfigurado(this.tienda);
  }

  get sunatFaltante(): string {
    const faltan = faltanteSunat(this.tienda);
    return faltan.length ? 'Falta: ' + faltan.join(' + ') : '';
  }
}
