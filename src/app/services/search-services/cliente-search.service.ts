import { Cliente } from '@/app/models/cliente.models';
import { Injectable } from '@angular/core';
import { QuerySearchCliente } from '../cliente.service';

@Injectable({
    providedIn: 'root'
})
export class ClienteSearchService {

    filtrarClientes(
        clientes: Cliente[],
        query: QuerySearchCliente
    ): { found: boolean; data: Cliente[] } {

        const text = query.text?.toLowerCase().trim();

        // 🔹 Si no hay texto, devolver todo
        if (!text) {
            return {
                found: clientes.length > 0,
                data: clientes
            };
        }

        const resultado = clientes.filter(cliente => {

            return (
                cliente.fullname?.toLowerCase().includes(text) ||
                cliente.firstname?.toLowerCase().includes(text) ||
                cliente.lastname?.toLowerCase().includes(text) ||
                cliente.document?.toLowerCase().includes(text) ||
                cliente.phone?.toLowerCase().includes(text) ||
                cliente.email?.toLowerCase().includes(text) ||
                cliente.address?.toLowerCase().includes(text) ||
                cliente.department?.toLowerCase().includes(text) ||
                cliente.province?.toLowerCase().includes(text) ||
                cliente.district?.toLowerCase().includes(text)
            );
        });

        return {
            found: resultado.length > 0,
            data: resultado
        };
    }
}
