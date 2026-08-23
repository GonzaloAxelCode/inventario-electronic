import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FeatureFlagsService {
    private readonly GUIAS_REMISION_KEY = 'feature-guias-remision';
    private readonly TIKTOK_KEY = 'feature-tiktok';
    private readonly COMPRAS_KEY = 'feature-compras';

    readonly guiasRemisionEnabled = signal<boolean>(this.getStoredFlag(this.GUIAS_REMISION_KEY, true));
    readonly tiktokEnabled = signal<boolean>(this.getStoredFlag(this.TIKTOK_KEY, false));
    readonly comprasEnabled = signal<boolean>(this.getStoredFlag(this.COMPRAS_KEY, true));

    readonly isGuiasRemisionEnabled = computed(() => this.guiasRemisionEnabled());
    readonly isTiktokEnabled = computed(() => this.tiktokEnabled());
    readonly isComprasEnabled = computed(() => this.comprasEnabled());

    private getStoredFlag(key: string, defaultValue: boolean): boolean {
        const stored = localStorage.getItem(key);
        if (stored === null) return defaultValue;
        return stored === 'true';
    }

    toggleGuiasRemision(): void {
        const current = this.guiasRemisionEnabled();
        this.guiasRemisionEnabled.set(!current);
        localStorage.setItem(this.GUIAS_REMISION_KEY, String(!current));
    }

    toggleTiktok(): void {
        const current = this.tiktokEnabled();
        this.tiktokEnabled.set(!current);
        localStorage.setItem(this.TIKTOK_KEY, String(!current));
    }

    toggleCompras(): void {
        const current = this.comprasEnabled();
        this.comprasEnabled.set(!current);
        localStorage.setItem(this.COMPRAS_KEY, String(!current));
    }
}
