import { PlanSuscripcion } from '@/app/models/tienda.models';
import { TiendaService } from '@/app/services/tienda.service';
import { DialogCreatePlanService } from '@/app/services/dialogs-services/dialog-createplan.service';
import { DialogUpdatePlanService } from '@/app/services/dialogs-services/dialog-updateplan.service';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { AppState } from '@/app/state/app.state';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-adminplanes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    TuiButton, TuiLoader,
  ],
  templateUrl: './adminplanes.component.html',
  styleUrl: './adminplanes.component.scss',
})
export class AdminplanesComponent implements OnInit, OnDestroy {
  planes: PlanSuscripcion[] = [];
  loading = true;
  error: string | null = null;
  isSuperUser = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private tiendaService: TiendaService,
    private store: Store<AppState>,
    private cdRef: ChangeDetectorRef,
    private dialogUpdatePlan: DialogUpdatePlanService,
    private dialogCreatePlan: DialogCreatePlanService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectCurrenttUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.isSuperUser = !!(user as any)?.is_superuser;
      this.cdRef.markForCheck();
    });
    // Solo muestra skeleton si no hay caché; si ya se cargó una vez, reuse sin HTTP.
    if (this.tiendaService.hasPlanesCache()) {
      this.loading = false;
    }
    this.loadPlanes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** force=true para recargar manualmente (ignora caché). */
  loadPlanes(force = false): void {
    if (!force && this.tiendaService.hasPlanesCache()) {
      // Lectura instantánea desde caché, sin spinner ni HTTP.
      this.tiendaService.listPlanes().pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.planes = Array.isArray(data) ? data : [];
          this.loading = false;
          this.cdRef.markForCheck();
        },
      });
      return;
    }
    this.loading = true;
    this.error = null;
    this.cdRef.markForCheck();
    this.tiendaService.listPlanes(force).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.planes = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'No se pudieron cargar los planes. Inténtalo de nuevo.';
        console.error('listPlanes error', err);
        this.cdRef.markForCheck();
      },
    });
  }

  isIlimitado(limite: number | null | undefined): boolean {
    return Number(limite ?? 0) >= 999999;
  }

  // Crear plan en modal (POST /api/planes/crear/ — solo superuser)
  startCreate(): void {
    this.dialogCreatePlan.open().subscribe((creado) => {
      if (creado) {
        this.planes = [...this.planes, creado];
        this.cdRef.markForCheck();
      }
    });
  }

  // Actualizar plan en modal (PUT /api/planes/<plan_id>/ — solo superuser)
  startEdit(plan: PlanSuscripcion): void {
    this.dialogUpdatePlan.open(plan).subscribe((actualizado) => {
      if (actualizado) {
        this.planes = this.planes.map(p => p.id === actualizado.id ? actualizado : p);
        this.cdRef.markForCheck();
      }
    });
  }
}
