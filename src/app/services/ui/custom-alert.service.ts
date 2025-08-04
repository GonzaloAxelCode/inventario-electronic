import { Injectable } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CustomAlertService {
    constructor(private readonly alerts: TuiAlertService) { }

    showSuccess(message: string, title: string = 'Éxito'): Observable<void> {
        return this.alerts.open(message, {
            label: title,
            closeable: true,
            autoClose: 3000,
            appearance: 'positive',
            icon: '@tui.badge-check', // Ícono fijo para éxito
        });
    }

    showError(message: string, title: string = 'Error'): Observable<void> {
        return this.alerts.open(message, {
            label: title,
            closeable: true,
            autoClose: 5000,
            appearance: 'negative',
            icon: '@tui.badge-x', // Ícono fijo para error
        });
    }

    showInfo(message: string, title: string = 'Información'): Observable<void> {
        return this.alerts.open(message, {
            label: title,
            closeable: true,
            autoClose: 3000,
            appearance: 'info',
            icon: '@tui.badge-info', // Ícono fijo para información
        });
    }

    showWarning(message: string, title: string = 'Advertencia'): Observable<void> {
        return this.alerts.open(message, {
            label: title,
            closeable: true,
            autoClose: 3000,
            appearance: 'warning',
            icon: '@tui.badge-info', // Ícono fijo para advertencia
        });
    }
}
