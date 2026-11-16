export interface Celular {
  id: number;
  tienda: number;
  tienda_nombre: string;
  marca: string;
  modelo: string;
  color: string;
  memoria: string;
  ram: string | null;
  estado_equipo: string;
  imei1: string;
  imei2: string | null;
  dualSim: boolean;
  costo_compra: string;
  precio_venta: string;
  disponible: boolean;
  imagen1: string | null;
  imagen2: string | null;
  activo: boolean;
  is_deleted: boolean;
  date_created: string;
  fecha_actualizacion: string;
}

export interface CelularesResponse {
  count: number;
  page: number;
  page_size: number;
  length_pages: number;
  results: Celular[];
}

export interface CelularPorMarca {
  marca: string;
  total: number;
  disponibles: number;
}

export interface CelularesPorMarcaResponse {
  por_marca: CelularPorMarca[];
}

export interface CelularTopCosto {
  id: number;
  marca: string;
  modelo: string;
  imei: string;
  costo_compra: number;
  precio_venta: number;
  disponible: boolean;
}

export interface CelularesTopCostoResponse {
  top_costo_compra: CelularTopCosto[];
  tipo?: string;
}

export interface CelularQuery {
  search?: string;
  marca?: string;
  color?: string;
  memoria?: string;
  estado_equipo?: string;
  disponible?: boolean | string;
  page?: number;
  page_size?: number;
}
