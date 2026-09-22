import { Tienda } from '@/app/models/tienda.models';

/** SUNAT listo solo si hay clave SOL y certificado cargados (flags del GET, sin valores reales). */
export function isSunatConfigurado(tienda: Partial<Tienda> | null | undefined): boolean {
  return !!tienda?.tiene_sol && !!tienda?.tiene_certificado;
}

/** Lista lo que falta: [] si está todo, si no 'clave SOL' y/o 'certificado'. */
export function faltanteSunat(tienda: Partial<Tienda> | null | undefined): string[] {
  const faltan: string[] = [];
  if (!tienda?.tiene_sol) faltan.push('clave SOL');
  if (!tienda?.tiene_certificado) faltan.push('certificado');
  return faltan;
}

/** Keys SUNAT de guías listas si el backend indica credenciales configuradas. */
export function isSunatGuiasConfigurado(tienda: Partial<Tienda> | null | undefined): boolean {
  if (tienda?.tiene_credenciales_guia !== undefined && tienda?.tiene_credenciales_guia !== null) {
    return !!tienda.tiene_credenciales_guia;
  }
  return !!tienda?.tiene_client_id && !!tienda?.tiene_client_secret;
}

/** Lista lo que falta de guías: [] si está todo, si no 'credenciales de guías'. */
export function faltanteSunatGuias(tienda: Partial<Tienda> | null | undefined): string[] {
  if (tienda?.tiene_credenciales_guia !== undefined && tienda?.tiene_credenciales_guia !== null) {
    return tienda.tiene_credenciales_guia ? [] : ['credenciales de guías'];
  }
  const faltan: string[] = [];
  if (!tienda?.tiene_client_id) faltan.push('client_id');
  if (!tienda?.tiene_client_secret) faltan.push('client_secret');
  return faltan;
}
