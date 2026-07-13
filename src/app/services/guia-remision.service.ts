import { GuiaRemisionRemitente, CreateGuiaRemision } from '@/app/models/guia-remision.models';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface GuiaRemisionResponse {
    count: number;
    next: string | null;
    previous: string | null;
    index_page: number;
    length_pages: number;
    results: GuiaRemisionRemitente[];
}

@Injectable({
    providedIn: 'root',
})
export class GuiaRemisionService {

    private mockData: GuiaRemisionRemitente[] = [
        {
            id: 1,
            serie: 'T001',
            correlativo: '0000001',
            fecha_emision: '2026-06-28',
            fecha_traslado: '2026-06-29',
            ruc_remitente: '20601234567',
            razon_social_remitente: 'Ferretería y Accesorios El Martillo S.A.C.',
            direccion_remitente: 'Av. Industrial 1235, San Martin de Porres, Lima',
            ubigeo_remitente: '150131',
            ruc_destinatario: '20543210987',
            razon_social_destinatario: 'Construcciones del Norte S.A.',
            direccion_destinatario: 'Jr. Cusco 456, Cercado de Lima',
            ubigeo_destinatario: '150101',
            punto_partida: 'Av. Industrial 1235, San Martin de Porres, Lima',
            punto_llegada: 'Jr. Cusco 456, Cercado de Lima',
            motivo_traslado: 'VENTA',
            motivo_traslado_display: 'Venta de mercadería',
            datos_transportista: {
                razon_social: 'Transportes Rápidos del Sur S.A.C.',
                ruc: '20456789012',
                nombre_chofer: 'Carlos Mendoza López',
                dni_chofer: '45678901',
                placa_vehiculo: 'ABC-123',
                numero_licencia: 'Q12345678',
            },
            items: [
                { codigo: 'FRR-001', descripcion: 'Martillo de uña 16oz Truper', unidad_medida: 'PIEZA', cantidad: 24, peso_kg: 12 },
                { codigo: 'FRR-002', descripcion: 'Taladro eléctrico Bosch GSB 550', unidad_medida: 'PIEZA', cantidad: 6, peso_kg: 9 },
                { codigo: 'FRR-003', descripcion: 'Caja de clavos 2" (1 kg)', unidad_medida: 'CAJA', cantidad: 50, peso_kg: 50 },
                { codigo: 'ACC-010', descripcion: 'Funda silicona iPhone 15 Pro Max', unidad_medida: 'PIEZA', cantidad: 100, peso_kg: 5 },
                { codigo: 'ACC-011', descripcion: 'Cable USB-C carga rápida 2m', unidad_medida: 'PIEZA', cantidad: 80, peso_kg: 4 },
            ],
            peso_total_kg: 80,
            num_bultos: 3,
            estado: 'EMITIDA',
            estado_display: 'Emitida',
            observaciones: 'Entregar en puerta principal. Llamar al 999888777 al llegar.',
            date_created: '2026-06-28T10:30:00Z',
            date_updated: '2026-06-28T10:30:00Z',
        },
        {
            id: 2,
            serie: 'T001',
            correlativo: '0000002',
            fecha_emision: '2026-06-29',
            fecha_traslado: '2026-06-30',
            ruc_remitente: '20601234567',
            razon_social_remitente: 'Ferretería y Accesorios El Martillo S.A.C.',
            direccion_remitente: 'Av. Industrial 1235, San Martin de Porres, Lima',
            ubigeo_remitente: '150131',
            ruc_destinatario: '20123456789',
            razon_social_destinatario: 'Ferretería El Tornillo S.R.L.',
            direccion_destinatario: 'Av. La Marina 789, San Miguel, Lima',
            ubigeo_destinatario: '150131',
            punto_partida: 'Av. Industrial 1235, San Martin de Porres, Lima',
            punto_llegada: 'Av. La Marina 789, San Miguel, Lima',
            motivo_traslado: 'VENTA',
            motivo_traslado_display: 'Venta de mercadería',
            datos_transportista: {
                razon_social: 'Transportes Rápidos del Sur S.A.C.',
                ruc: '20456789012',
                nombre_chofer: 'Roberto García Pérez',
                dni_chofer: '33445566',
                placa_vehiculo: 'XYZ-789',
                numero_licencia: 'Q87654321',
            },
            items: [
                { codigo: 'FRR-004', descripcion: 'Pintura vinílica blanca 1 galón', unidad_medida: 'GALON', cantidad: 20, peso_kg: 30 },
                { codigo: 'FRR-005', descripcion: 'Rodillo para pintura 9"', unidad_medida: 'PIEZA', cantidad: 30, peso_kg: 6 },
                { codigo: 'ACC-020', descripcion: 'Audífonos Bluetooth TWS Pro', unidad_medida: 'PIEZA', cantidad: 50, peso_kg: 2.5 },
            ],
            peso_total_kg: 38.5,
            num_bultos: 2,
            estado: 'EN_TRANSITO',
            estado_display: 'En tránsito',
            observaciones: 'Mercadería frágil, manipular con cuidado.',
            date_created: '2026-06-29T08:15:00Z',
            date_updated: '2026-06-30T14:20:00Z',
        },
        {
            id: 3,
            serie: 'T001',
            correlativo: '0000003',
            fecha_emision: '2026-06-30',
            fecha_traslado: '2026-07-01',
            ruc_remitente: '20601234567',
            razon_social_remitente: 'Ferretería y Accesorios El Martillo S.A.C.',
            direccion_remitente: 'Av. Industrial 1235, San Martin de Porres, Lima',
            ubigeo_remitente: '150131',
            ruc_destinatario: '20987654321',
            razon_social_destinatario: 'Distribuidora de Celulares Express S.A.',
            direccion_destinatario: 'Av. Emancipación 321, Cercado de Lima',
            ubigeo_destinatario: '150101',
            punto_partida: 'Av. Industrial 1235, San Martin de Porres, Lima',
            punto_llegada: 'Av. Emancipación 321, Cercado de Lima',
            motivo_traslado: 'VENTA',
            motivo_traslado_display: 'Venta de mercadería',
            datos_transportista: {
                razon_social: 'Logística y Transportes Unidos S.A.C.',
                ruc: '20678901234',
                nombre_chofer: 'Juan Torres Ramírez',
                dni_chofer: '77889900',
                placa_vehiculo: 'DEF-456',
                numero_licencia: 'Q11223344',
            },
            items: [
                { codigo: 'ACC-030', descripcion: 'Mica templada Samsung Galaxy S24 Ultra', unidad_medida: 'PIEZA', cantidad: 200, peso_kg: 4 },
                { codigo: 'ACC-031', descripcion: 'Carcasa protectora iPhone 15', unidad_medida: 'PIEZA', cantidad: 150, peso_kg: 7.5 },
                { codigo: 'ACC-032', descripcion: 'Cargador inalámbrico MagSafe 15W', unidad_medida: 'PIEZA', cantidad: 80, peso_kg: 8 },
                { codigo: 'ACC-033', descripcion: 'Auriculares con cable Type-C', unidad_medida: 'PIEZA', cantidad: 120, peso_kg: 6 },
            ],
            peso_total_kg: 25.5,
            num_bultos: 4,
            estado: 'EMITIDA',
            estado_display: 'Emitida',
            observaciones: 'Horario de entrega: 9am - 5pm.',
            date_created: '2026-06-30T16:45:00Z',
            date_updated: '2026-06-30T16:45:00Z',
        },
        {
            id: 4,
            serie: 'T001',
            correlativo: '0000004',
            fecha_emision: '2026-07-01',
            fecha_traslado: '2026-07-02',
            ruc_remitente: '20601234567',
            razon_social_remitente: 'Ferretería y Accesorios El Martillo S.A.C.',
            direccion_remitente: 'Av. Industrial 1235, San Martin de Porres, Lima',
            ubigeo_remitente: '150131',
            ruc_destinatario: '20345678901',
            razon_social_destinatario: 'Constructora Horizon S.A.C.',
            direccion_destinatario: 'Ca. Los Olivos 567, Los Olivos, Lima',
            ubigeo_destinatario: '150128',
            punto_partida: 'Av. Industrial 1235, San Martin de Porres, Lima',
            punto_llegada: 'Ca. Los Olivos 567, Los Olivos, Lima',
            motivo_traslado: 'VENTA',
            motivo_traslado_display: 'Venta de mercadería',
            datos_transportista: {
                razon_social: 'Transportes Rápidos del Sur S.A.C.',
                ruc: '20456789012',
                nombre_chofer: 'Luis Fernández Castillo',
                dni_chofer: '55667788',
                placa_vehiculo: 'GHI-012',
                numero_licencia: 'Q99887766',
            },
            items: [
                { codigo: 'FRR-010', descripcion: 'Sierra circular 7 1/4" Makita', unidad_medida: 'PIEZA', cantidad: 3, peso_kg: 12 },
                { codigo: 'FRR-011', descripcion: 'Disco de corte para metal 7"', unidad_medida: 'PIEZA', cantidad: 20, peso_kg: 8 },
                { codigo: 'FRR-012', descripcion: 'Compresor de aire 5HP', unidad_medida: 'PIEZA', cantidad: 1, peso_kg: 35 },
                { codigo: 'FRR-013', descripcion: 'Manguera de alta presión 10m', unidad_medida: 'PIEZA', cantidad: 5, peso_kg: 7.5 },
            ],
            peso_total_kg: 62.5,
            num_bultos: 2,
            estado: 'ENTREGADA',
            estado_display: 'Entregada',
            observaciones: 'Entrega completada sin novedad.',
            date_created: '2026-07-01T09:00:00Z',
            date_updated: '2026-07-02T11:30:00Z',
        },
        {
            id: 5,
            serie: 'T001',
            correlativo: '0000005',
            fecha_emision: '2026-07-02',
            fecha_traslado: '2026-07-03',
            ruc_remitente: '20601234567',
            razon_social_remitente: 'Ferretería y Accesorios El Martillo S.A.C.',
            direccion_remitente: 'Av. Industrial 1235, San Martin de Porres, Lima',
            ubigeo_remitente: '150131',
            ruc_destinatario: '20765432109',
            razon_social_destinatario: 'TechAccesorios Perú S.A.',
            direccion_destinatario: 'Av. Javier Prado Este 1050, Surco, Lima',
            ubigeo_destinatario: '150133',
            punto_partida: 'Av. Industrial 1235, San Martin de Porres, Lima',
            punto_llegada: 'Av. Javier Prado Este 1050, Surco, Lima',
            motivo_traslado: 'VENTA',
            motivo_traslado_display: 'Venta de mercadería',
            datos_transportista: {
                razon_social: 'Logística y Transportes Unidos S.A.C.',
                ruc: '20678901234',
                nombre_chofer: 'Pedro Alvarez Vargas',
                dni_chofer: '11223344',
                placa_vehiculo: 'JKL-345',
                numero_licencia: 'Q55443322',
            },
            items: [
                { codigo: 'ACC-040', descripcion: 'Power bank 20000mAh fast charge', unidad_medida: 'PIEZA', cantidad: 60, peso_kg: 18 },
                { codigo: 'ACC-041', descripcion: 'Smartwatch deportivo BT 5.0', unidad_medida: 'PIEZA', cantidad: 40, peso_kg: 4 },
                { codigo: 'ACC-042', descripcion: 'Soporte para celular de escritorio', unidad_medida: 'PIEZA', cantidad: 100, peso_kg: 10 },
                { codigo: 'ACC-043', descripcion: 'Parlador bluetooth portátil 10W', unidad_medida: 'PIEZA', cantidad: 30, peso_kg: 9 },
                { codigo: 'FRR-020', descripcion: 'Llave allen juego 6 piezas', unidad_medida: 'JUEGO', cantidad: 25, peso_kg: 2.5 },
            ],
            peso_total_kg: 43.5,
            num_bultos: 3,
            estado: 'ANULADA',
            estado_display: 'Anulada',
            observaciones: 'Guía anulada por error en datos del destinatario.',
            date_created: '2026-07-02T13:20:00Z',
            date_updated: '2026-07-02T15:00:00Z',
        },
        {
            id: 6,
            serie: 'T001',
            correlativo: '0000006',
            fecha_emision: '2026-07-03',
            fecha_traslado: '2026-07-04',
            ruc_remitente: '20601234567',
            razon_social_remitente: 'Ferretería y Accesorios El Martillo S.A.C.',
            direccion_remitente: 'Av. Industrial 1235, San Martin de Porres, Lima',
            ubigeo_remitente: '150131',
            ruc_destinatario: '20111222333',
            razon_social_destinatario: 'Ferretería y Ferretería del Centro S.R.L.',
            direccion_destinatario: 'Jr. Huancavelica 200, Cercado de Lima',
            ubigeo_destinatario: '150101',
            punto_partida: 'Av. Industrial 1235, San Martin de Porres, Lima',
            punto_llegada: 'Jr. Huancavelica 200, Cercado de Lima',
            motivo_traslado: 'VENTA',
            motivo_traslado_display: 'Venta de mercadería',
            datos_transportista: {
                razon_social: 'Transportes Rápidos del Sur S.A.C.',
                ruc: '20456789012',
                nombre_chofer: 'Miguel Rojas Díaz',
                dni_chofer: '66778899',
                placa_vehiculo: 'MNO-678',
                numero_licencia: 'Q33221100',
            },
            items: [
                { codigo: 'FRR-030', descripcion: 'Tubería PVC 1/2" (6m)', unidad_medida: 'PIEZA', cantidad: 40, peso_kg: 24 },
                { codigo: 'FRR-031', descripcion: 'Codo PVC 1/2"', unidad_medida: 'PIEZA', cantidad: 100, peso_kg: 5 },
                { codigo: 'FRR-032', descripcion: 'Pegamento para PVC 100ml', unidad_medida: 'PIEZA', cantidad: 30, peso_kg: 4.5 },
                { codigo: 'FRR-033', descripcion: 'Cinta teflón 1/2" (10m)', unidad_medida: 'PIEZA', cantidad: 50, peso_kg: 1 },
            ],
            peso_total_kg: 34.5,
            num_bultos: 2,
            estado: 'EMITIDA',
            estado_display: 'Emitida',
            observaciones: 'Confirmar disponibilidad antes del envío.',
            date_created: '2026-07-03T11:10:00Z',
            date_updated: '2026-07-03T11:10:00Z',
        },
    ];

    getGuias(page: number = 1, page_size: number = 10, busqueda?: string): Observable<GuiaRemisionResponse> {
        let filtered = [...this.mockData];

        if (busqueda) {
            const term = busqueda.toLowerCase();
            filtered = filtered.filter(g =>
                g.correlativo.includes(term) ||
                g.razon_social_destinatario.toLowerCase().includes(term) ||
                g.ruc_destinatario.includes(term) ||
                g.estado.toLowerCase().includes(term) ||
                g.datos_transportista.placa_vehiculo.toLowerCase().includes(term)
            );
        }

        const start = (page - 1) * page_size;
        const paginated = filtered.slice(start, start + page_size);

        const response: GuiaRemisionResponse = {
            count: filtered.length,
            next: start + page_size < filtered.length ? 'next' : null,
            previous: page > 1 ? 'previous' : null,
            index_page: page,
            length_pages: Math.ceil(filtered.length / page_size),
            results: paginated,
        };

        return of(response).pipe(delay(400));
    }

    getGuiaById(id: number): Observable<GuiaRemisionRemitente | undefined> {
        const found = this.mockData.find(g => g.id === id);
        return of(found).pipe(delay(200));
    }

    crearGuia(guia: CreateGuiaRemision): Observable<GuiaRemisionRemitente> {
        const newId = Math.max(...this.mockData.map(g => g.id)) + 1;
        const newGuia: GuiaRemisionRemitente = {
            id: newId,
            serie: guia.serie || 'T001',
            correlativo: guia.correlativo || String(newId).padStart(7, '0'),
            fecha_emision: guia.fecha_emision || new Date().toISOString().split('T')[0],
            fecha_traslado: guia.fecha_traslado || new Date().toISOString().split('T')[0],
            ruc_remitente: guia.ruc_remitente || '20601234567',
            razon_social_remitente: guia.razon_social_remitente || 'Ferretería y Accesorios El Martillo S.A.C.',
            direccion_remitente: guia.direccion_remitente || 'Av. Industrial 1235, San Martin de Porres, Lima',
            ubigeo_remitente: guia.ubigeo_remitente || '150131',
            ruc_destinatario: guia.ruc_destinatario || '',
            razon_social_destinatario: guia.razon_social_destinatario || '',
            direccion_destinatario: guia.direccion_destinatario || '',
            ubigeo_destinatario: guia.ubigeo_destinatario || '150101',
            punto_partida: guia.punto_partida || '',
            punto_llegada: guia.punto_llegada || '',
            motivo_traslado: guia.motivo_traslado || 'VENTA',
            motivo_traslado_display: 'Venta de mercadería',
            datos_transportista: guia.datos_transportista || {
                razon_social: '',
                ruc: '',
                nombre_chofer: '',
                dni_chofer: '',
                placa_vehiculo: '',
                numero_licencia: '',
            },
            items: guia.items || [],
            peso_total_kg: guia.peso_total_kg || 0,
            num_bultos: guia.num_bultos || 1,
            estado: 'EMITIDA',
            estado_display: 'Emitida',
            observaciones: guia.observaciones || '',
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString(),
        };
        this.mockData.unshift(newGuia);
        return of(newGuia).pipe(delay(500));
    }

    anularGuia(id: number): Observable<GuiaRemisionRemitente> {
        const guia = this.mockData.find(g => g.id === id);
        if (!guia) {
            return throwError(() => new Error('Guía no encontrada'));
        }
        guia.estado = 'ANULADA';
        guia.estado_display = 'Anulada';
        guia.date_updated = new Date().toISOString();
        return of(guia).pipe(delay(300));
    }
}
