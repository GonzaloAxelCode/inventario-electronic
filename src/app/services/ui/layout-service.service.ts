import { Injectable, signal, computed } from '@angular/core';

export type LayoutMode = 'sidebar' | 'topnav';

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    private readonly STORAGE_KEY = 'app-layout-mode';
    
    private layoutMode = signal<LayoutMode>(this.getStoredLayout());
    
    readonly currentLayout = computed(() => this.layoutMode());
    readonly isSidebar = computed(() => this.layoutMode() === 'sidebar');
    readonly isTopnav = computed(() => this.layoutMode() === 'topnav');

    private getStoredLayout(): LayoutMode {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored === 'sidebar' || stored === 'topnav') {
            return stored;
        }
        return 'topnav';
    }

    setLayout(mode: LayoutMode): void {
        this.layoutMode.set(mode);
        localStorage.setItem(this.STORAGE_KEY, mode);
    }

    toggleLayout(): void {
        const current = this.layoutMode();
        const newMode: LayoutMode = current === 'sidebar' ? 'topnav' : 'sidebar';
        this.setLayout(newMode);
    }
}
