import { Pedido } from '@/app/models/pedido.models';
import { Injectable } from '@angular/core';

const STORAGE_KEY = 'pedidos_sala_ventas';

@Injectable({
    providedIn: 'root',
})
export class PedidoSalaService {

    getPedidos(): Pedido[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    savePedido(pedido: Pedido): void {
        const pedidos = this.getPedidos();
        const exists = pedidos.findIndex(p => p.id === pedido.id);
        if (exists >= 0) {
            pedidos[exists] = pedido;
        } else {
            pedidos.push(pedido);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
    }

    removePedido(pedidoId: number): void {
        const pedidos = this.getPedidos().filter(p => p.id !== pedidoId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
    }

    hasPedido(pedidoId: number): boolean {
        return this.getPedidos().some(p => p.id === pedidoId);
    }

    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}
