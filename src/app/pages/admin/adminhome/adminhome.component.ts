import { User } from '@/app/models/user.models';
import { getPropietarioId, getPropietarioLabel } from '@/app/models/tienda.models';
import { loadUserAction } from '@/app/state/actions/user.actions';
import { loadTiendasAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, take } from 'rxjs';
import { TuiPieChart } from '@taiga-ui/addon-charts';
import { PlanbadgeComponent } from '@/app/components/planbadge/planbadge.component';

interface AdminStats {
  esSuper: boolean;
  total: number;
  activas: number;
  inactivas: number;
  sucursales: number;
  miembros: number;
  barras: Array<{ label: string; valor: number; sub?: string }>;
  barrasTitulo: string;
  barrasSubtitulo: string;
  maxBarra: number;
}

@Component({
  selector: 'app-adminhome',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PlanbadgeComponent, TuiPieChart],
  templateUrl: './adminhome.component.html',
  styleUrl: './adminhome.component.scss'
})
export class AdminhomeComponent implements OnInit {
  user$: Observable<User | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  constructor(private store: Store<AppState>) {
    const userState$ = this.store.select(selectUsersState);
    this.user$ = userState$.pipe(map(s => s.user ?? null));
    this.loading$ = userState$.pipe(map(s => !!s.loadingCurrentUser));
    this.error$ = userState$.pipe(map(s => s.errors));
  }

  ngOnInit(): void {
    this.store.select(selectUsersState).pipe(take(1)).subscribe(state => {
      if (!state.user && !state.loadingCurrentUser) {
        this.store.dispatch(loadUserAction());
      }
    });
    // Tiendas para las estadísticas (solo frontend: se usa lo que ya trae el store)
    this.store.select(selectTiendaState).pipe(take(1)).subscribe(state => {
      if (!state.tiendasLoaded && !state.loadingTiendas) {
        this.store.dispatch(loadTiendasAction());
      }
    });
  }

  /** Estadísticas calculadas solo con info del frontend (store de tiendas + usuario). */
  public readonly stats$: Observable<AdminStats> = combineLatest([
    this.store.select(selectTiendaState),
    this.store.select(selectUsersState).pipe(map(s => s.user ?? null)),
  ]).pipe(
    map(([tiendaState, user]) => {
      const vigentes = (tiendaState.tiendas ?? []).filter((t: any) => !t?.is_deleted);
      const esSuper = !!user?.is_superuser;
      let scope = vigentes;
      if (!esSuper) {
        const raw: any = (user as any)?.tienda;
        const uid = typeof raw === 'number' ? raw : raw?.id ?? (user as any)?.tienda_data?.id ?? null;
        const byId = new Map(vigentes.map(t => [t.id, t]));
        const principal = uid != null ? byId.get(uid) ?? null : null;
        if (principal) {
          const ids = new Set<number>([principal.id]);
          for (const t of vigentes) if (t.tienda_padre === principal.id) ids.add(t.id);
          for (const s of principal.sucursales ?? []) ids.add(s.id);
          scope = vigentes.filter(t => ids.has(t.id));
        } else {
          const me = (user as any)?.id;
          scope = vigentes.filter(t =>
            getPropietarioId(t) === me ||
            (t.users_tienda ?? []).some((u: any) => u.id === me));
        }
      }
      const miembrosDe = (t: any): number => {
        const m = (t.users_tienda ?? []).length || 0;
        if (m > 0) return m;
        return Number(t?.tienda_stats?.num_personal ?? 0);
      };
      const total = scope.length;
      const activas = scope.filter(t => t.activo).length;
      const sucursales = scope.filter(t => t.tienda_padre != null).length;
      const miembros = scope.reduce((s, t) => s + miembrosDe(t), 0);
      let barras: AdminStats['barras'];
      let barrasTitulo: string;
      let barrasSubtitulo: string;
      if (esSuper) {
        const porPlan = new Map<string, number>();
        for (const t of scope) {
          const k = ((t.subscripcion_data?.nombre_plan || 'Sin plan') as string).trim() || 'Sin plan';
          porPlan.set(k, (porPlan.get(k) ?? 0) + 1);
        }
        barras = [...porPlan.entries()]
          .map(([label, valor]) => ({ label, valor }))
          .sort((a, b) => b.valor - a.valor);
        barrasTitulo = 'Tiendas por plan';
        barrasSubtitulo = 'Cantidad de tiendas por plan contratado';
      } else {
        barras = scope
          .map(t => ({
            label: t.nombre,
            valor: miembrosDe(t),
            sub: t.tienda_padre != null ? 'Sucursal' : 'Principal',
          }))
          .sort((a, b) => b.valor - a.valor);
        barrasTitulo = 'Miembros por tienda';
        barrasSubtitulo = 'Personal de tu tienda principal y sucursales';
      }
      return {
        esSuper,
        total,
        activas,
        inactivas: Math.max(0, total - activas),
        sucursales,
        miembros,
        barras,
        barrasTitulo,
        barrasSubtitulo,
        maxBarra: Math.max(1, ...barras.map(b => b.valor)),
      };
    })
  );

  public readonly ownerStoreCounts$ = this.store.select(selectTiendaState).pipe(
    map(tiendaState => {
      const tiendas = (tiendaState.tiendas ?? []).filter((t: any) => !t?.is_deleted);
      const ownerMap = new Map<number, { name: string; count: number }>();
      for (const t of tiendas) {
        const ownerId = getPropietarioId(t);
        if (ownerId != null) {
          const existing = ownerMap.get(ownerId);
          if (existing) {
            existing.count++;
          } else {
            ownerMap.set(ownerId, { name: getPropietarioLabel(t), count: 1 });
          }
        }
      }
      return Array.from(ownerMap.entries()).map(([ownerId, { name, count }]) => ({
        ownerId,
        ownerName: name,
        tiendaCount: count,
      })).sort((a, b) => b.tiendaCount - a.tiendaCount);
    })
  );

  reload(): void {
    this.store.dispatch(loadUserAction());
  }

  getInitials(user: User | null): string {
    if (!user) return 'U';
    const a = user.first_name?.charAt(0) || '';
    const b = user.last_name?.charAt(0) || '';
    if (a || b) return (a + b).toUpperCase();
    return (user.username?.charAt(0) || 'U').toUpperCase();
  }

  get saludo(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

nombreCorto(user: User | null): string {
    if (!user) return '';
    return user.first_name || user.username || '';
  }

  selectedOwnerId: number | null = null;
}