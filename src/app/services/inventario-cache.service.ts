import { Inventario } from '@/app/models/inventario.models';
import { Injectable } from '@angular/core';
import { deleteDB, openDB } from 'idb';

@Injectable({ providedIn: 'root' })
export class InventarioCacheService {
    private static readonly DB_NAME = 'inventario-db';

    private dbPromise = this.createDbPromise();

    private createDbPromise() {
        return openDB(InventarioCacheService.DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('inventarios')) {
                    db.createObjectStore('inventarios', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta');
                }
            }
        });
    }

    async getAll(): Promise<Inventario[]> {
        const db = await this.dbPromise;
        return db.getAll('inventarios');
    }

    async saveAll(inventarios: Inventario[]) {
        const db = await this.dbPromise;
        const tx = db.transaction('inventarios', 'readwrite');
        inventarios.forEach(i => tx.store.put(i));
        await tx.done;
    }

    async clear() {
        const db = await this.dbPromise;
        await db.clear('inventarios');
    }

    async clearAll() {
        const db = await this.dbPromise;
        const tx = db.transaction(['inventarios', 'meta'], 'readwrite');
        await Promise.all([
            tx.objectStore('inventarios').clear(),
            tx.objectStore('meta').clear(),
            tx.done
        ]);
    }
async deleteDatabase() {
        const db = await this.dbPromise;
        db.close();
        await deleteDB(InventarioCacheService.DB_NAME);
        this.dbPromise = this.createDbPromise();
    }

    async setLastSync(date: string) {
        const db = await this.dbPromise;
        await db.put('meta', date, 'lastSync');
    }

    async getLastSync(): Promise<string | null> {
        const db = await this.dbPromise;
        return db.get('meta', 'lastSync');
    }
}
