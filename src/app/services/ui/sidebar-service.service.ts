import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SidebarService {
    // Estado compartido usando signal()
    open = signal(false);

    // Método para cerrar
    public close(): void {
        this.open.set(false);
    }

    // Método para abrir
    public openModal(): void {
        this.open.set(true);
    }

    // Método para obtener el estado (puedes usarlo en la plantilla con signal())
    public isOpen() {
        return this.open;
    }
}
