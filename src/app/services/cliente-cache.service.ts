import { Injectable } from '@angular/core';
import { deleteDB, openDB } from 'idb';
import { Cliente } from '../models/cliente.models';

@Injectable({ providedIn: 'root' })
export class ClienteCacheService {
    private static readonly DB_NAME = 'clientes-db';

    private dbPromise = this.createDbPromise();

    private createDbPromise() {
        return openDB(ClienteCacheService.DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('clientes')) {
                    db.createObjectStore('clientes', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta');
                }
            }
        });
    }

    async getAll(): Promise<Cliente[]> {
        const db = await this.dbPromise;
        return db.getAll('clientes');
    }

    async saveAll(clientes: Cliente[]) {
        const db = await this.dbPromise;
        const tx = db.transaction('clientes', 'readwrite');
        clientes.forEach(i => tx.store.put(i));
        await tx.done;
    }

    async clear() {
        const db = await this.dbPromise;
        await db.clear('clientes');
    }

    async clearAll() {
        const db = await this.dbPromise;
        const tx = db.transaction(['clientes', 'meta'], 'readwrite');
        await Promise.all([
            tx.objectStore('clientes').clear(),
            tx.objectStore('meta').clear(),
            tx.done
        ]);
    }
async deleteDatabase() {
        const db = await this.dbPromise;
        db.close();
        await deleteDB(ClienteCacheService.DB_NAME);
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
