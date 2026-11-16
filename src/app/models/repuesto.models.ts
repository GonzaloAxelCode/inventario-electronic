export interface Repuesto {
  id: number;
  tienda: number;
  tienda_nombre: string;
  categoria: number | null;
  categoria_nombre: string | null;
  proveedor: number | null;
  proveedor_nombre: string | null;
  nombre: string;
  modelos_compatibles: string;
  ubicacion: string | null;
  imagen1: string | null;
  imagen2: string | null;
  stock: number;
  /** Alias de compatibilidad (backend también lo devuelve). Usar stock. */
  cantidad?: number;
  valorizacion: number;
  activo: boolean;
  is_deleted: boolean;
  date_created: string;
  fecha_actualizacion: string;
}

export interface RepuestosResponse {
  count: number;
  page: number;
  page_size: number;
  length_pages: number;
  results: Repuesto[];
}

export interface RepuestoQuery {
  search?: string;
  tipo?: string;
  ubicacion?: string;
  proveedor?: number | string;
  categoria?: number | string;
  page?: number;
  page_size?: number;
}
