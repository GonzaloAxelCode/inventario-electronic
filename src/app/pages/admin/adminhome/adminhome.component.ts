import { User } from '@/app/models/user.models';
import { loadUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { PlanbadgeComponent } from '@/app/components/planbadge/planbadge.component';

@Component({
  selector: 'app-adminhome',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PlanbadgeComponent],
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
  }

  public readonly ownerStoreCounts$ = this.store.select(selectTiendaState).pipe(
    map(tiendaState => {
      const tiendas = tiendaState.tiendas ?? [];
      const ownerMap = new Map<number, { name: string; count: number }>();
      for (const t of tiendas) {
        const ownerId = t.propietario;
        if (ownerId != null) {
          const existing = ownerMap.get(ownerId);
          if (existing) {
            existing.count++;
          } else {
            const name = t.propietario_data
              ? `${t.propietario_data.first_name || ''} ${t.propietario_data.last_name || ''}`.trim()
              : `Propietario #${ownerId}`;
            ownerMap.set(ownerId, { name, count: 1 });
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