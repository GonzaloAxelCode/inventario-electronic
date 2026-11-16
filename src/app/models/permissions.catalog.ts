/** Catálogo único de permisos del frontend (espejo de apps/user/permissions_catalog.py).
 *  Usado por Mis permisos (lectura) y el diálogo de edición (escritura). */

export interface PermisoItem {
  key: string;
  label: string;
}

export interface PermisoGrupo {
  id: string;
  titulo: string;
  items: PermisoItem[];
}

/** Acceso efectivo: superuser y propietario pasan siempre (igual que el backend). */
export function tienePermiso(user: any, key: string): boolean {
  if (!user) return false;
  if (user.is_superuser || user.es_propietario) return true;
  return !!user.permissions?.[key];
}

export const PERMISSION_GROUPS: PermisoGrupo[] = [
  {
    id: 'ventas',
    titulo: 'Ventas',
    items: [
      { key: 'can_make_sale', label: 'Realizar ventas' },
      { key: 'can_cancel_sale', label: 'Cancelar ventas' },
    ],
  },
  {
    id: 'inventario',
    titulo: 'Inventario (accesorios y repuestos)',
    items: [
      { key: 'can_create_inventory', label: 'Crear inventario' },
      { key: 'can_modify_inventory', label: 'Modificar inventario' },
      { key: 'can_delete_inventory', label: 'Eliminar inventario' },
    ],
  },
  {
    id: 'celulares',
    titulo: 'Celulares',
    items: [
      { key: 'can_create_celular', label: 'Crear celulares' },
      { key: 'can_update_celular', label: 'Modificar celulares' },
      { key: 'can_delete_celular', label: 'Eliminar celulares' },
    ],
  },
  {
    id: 'compras',
    titulo: 'Compras',
    items: [
      { key: 'can_create_compra', label: 'Crear compras' },
      { key: 'can_update_compra', label: 'Modificar compras' },
      { key: 'can_delete_compra', label: 'Eliminar compras' },
    ],
  },
  {
    id: 'pedidos',
    titulo: 'Pedidos / Pendientes',
    items: [{ key: 'can_manage_pedido', label: 'Gestionar pedidos pendientes' }],
  },
  {
    id: 'estadisticas',
    titulo: 'Estadísticas',
    items: [
      { key: 'view_stats_general', label: 'Ver estadística general' },
      { key: 'view_stats_ventas', label: 'Ver estadísticas de ventas' },
      { key: 'view_stats_inventario', label: 'Ver estadísticas de inventario' },
    ],
  },
  {
    id: 'ganancias',
    titulo: 'Ganancias',
    items: [{ key: 'view_ganancia', label: 'Ver ganancias' }],
  },
  {
    id: 'exportar',
    titulo: 'Exportar datos',
    items: [{ key: 'can_export_data', label: 'Exportar datos a CSV' }],
  },
  {
    id: 'backups',
    titulo: 'Backups',
    items: [{ key: 'can_make_backup', label: 'Realizar backups' }],
  },
];
