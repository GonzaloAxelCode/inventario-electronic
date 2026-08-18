import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FeatureFlagsService {
    private readonly GUIAS_REMISION_KEY = 'feature-guias-remision';
    private readonly TIKTOK_KEY = 'feature-tiktok';

    readonly guiasRemisionEnabled = signal<boolean>(this.getStoredFlag(this.GUIAS_REMISION_KEY, true));
    readonly tiktokEnabled = signal<boolean>(this.getStoredFlag(this.TIKTOK_KEY, false));

    readonly isGuiasRemisionEnabled = computed(() => this.guiasRemisionEnabled());
    readonly isTiktokEnabled = computed(() => this.tiktokEnabled());

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
}
