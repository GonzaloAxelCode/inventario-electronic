export interface CategoriaPredefinida {
  nombre: string;
  descripcion: string;
}

export interface GrupoCategorias {
  id: 'celulares' | 'accesorios' | 'repuestos';
  label: string;
  desc: string;
  items: CategoriaPredefinida[];
}

export const CATEGORIAS_PREDEFINIDAS: GrupoCategorias[] = [
  {
    id: 'celulares',
    label: 'Celulares',
    desc: 'Venta con IMEI',
    items: [
      { nombre: 'Sellado', descripcion: 'Equipo nuevo sellado en caja' },
      { nombre: 'Nuevo', descripcion: 'Equipo nuevo abierto' },
      { nombre: 'Seminuevo', descripcion: 'Equipo usado en buen estado' },
      { nombre: 'Reacondicionado', descripcion: 'Equipo reparado y verificado' },
    ],
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    desc: 'Fundas, micas y carga',
    items: [
      { nombre: 'Fundas', descripcion: 'Cases y protectores' },
      { nombre: 'Micas de vidrio', descripcion: 'Vidrio templado' },
      { nombre: 'Hidrogel', descripcion: 'Micas de hidrogel' },
      { nombre: 'Cargadores', descripcion: 'Cargadores de pared y portátiles' },
      { nombre: 'Cables', descripcion: 'Cables USB y tipo C' },
      { nombre: 'Audífonos', descripcion: 'Con cable y bluetooth' },
      { nombre: 'Parlantes', descripcion: 'Parlantes portátiles' },
      { nombre: 'Smartwatch', descripcion: 'Relojes y correas' },
    ],
  },
  {
    id: 'repuestos',
    label: 'Repuestos',
    desc: 'Solo taller',
    items: [
      { nombre: 'Pantallas', descripcion: 'Screens y táctiles' },
      { nombre: 'Baterías', descripcion: 'Baterías internas' },
      { nombre: 'Pines de carga', descripcion: 'Centros de carga' },
      { nombre: 'Flex y cámaras', descripcion: 'Flex, cámaras y tapas' },
    ],
  },
];
