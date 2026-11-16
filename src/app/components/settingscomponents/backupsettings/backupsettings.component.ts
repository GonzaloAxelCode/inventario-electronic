import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs';
import { map } from 'rxjs';
import { ReportExportService } from '@/app/services/report-export.service';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-backupsettings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backupsettings.component.html',
  styleUrl: './backupsettings.component.scss',
})
export class BackupsettingsComponent {
  private readonly exportService = inject(ReportExportService);
  private readonly store = inject(Store<AppState>);

  perms$ = this.store.select(selectCurrenttUser).pipe(map((u) => u?.permissions));

  meses = MESES;
  currentYear = new Date().getFullYear();
  years = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  month = new Date().getMonth() + 1;
  year = this.currentYear;
  monthCompras = new Date().getMonth() + 1;
  yearCompras = this.currentYear;

  loading: Record<string, boolean> = {};

  descargarTabla(grupo: 'accesorios' | 'celulares' | 'repuestos' | 'clientes'): void {
    const key = `tabla-${grupo}`;
    this.loading[key] = true;
    const obs = grupo === 'clientes'
      ? this.exportService.exportClientesTabla()
      : this.exportService.exportInventario(grupo);
    obs
      .pipe(finalize(() => (this.loading[key] = false)))
      .subscribe({
        next: (blob) => this.exportService.saveBlob(blob, `${grupo}.csv`),
        error: (err) => this.mostrarError(err),
      });
  }

  descargarComprobantes(): void {
    const pad = String(this.month).padStart(2, '0');
    this.loading['comprobantes'] = true;
    this.exportService.exportComprobantesZip(this.month, this.year)
      .pipe(finalize(() => (this.loading['comprobantes'] = false)))
      .subscribe({
        next: (blob) => this.exportService.saveBlob(blob, `comprobantes_${this.year}-${pad}.zip`),
        error: (err) => this.mostrarError(err),
      });
  }

  descargarCompras(): void {
    const pad = String(this.monthCompras).padStart(2, '0');
    this.loading['compras'] = true;
    this.exportService.exportComprasZip(this.monthCompras, this.yearCompras)
      .pipe(finalize(() => (this.loading['compras'] = false)))
      .subscribe({
        next: (blob) => this.exportService.saveBlob(blob, `compras_${this.yearCompras}-${pad}.zip`),
        error: (err) => this.mostrarError(err),
      });
  }

  private mostrarError(err: any): void {
    console.error('Error al descargar respaldo', err);
    const status = err?.status;
    alert(
      status === 400 ? 'Elige un mes y año válidos.'
      : status === 401 ? 'Tu sesión venció. Vuelve a iniciar sesión e inténtalo de nuevo.'
      : status === 403 ? 'No tienes permiso para backups. Pide a tu administrador que te habilite «Realizar backups».'
      : status === 404 ? 'El backend no tiene este endpoint. Reinicia el servidor backend con el código actualizado.'
      : status >= 500 ? 'Error en el servidor al generar el respaldo. Revisa el log del backend.'
      : 'No se pudo descargar el respaldo. Revisa tu conexión e inténtalo de nuevo.'
    );
  }
}
