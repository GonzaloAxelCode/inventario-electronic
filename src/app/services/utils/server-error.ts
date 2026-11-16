/** Extrae el mensaje detallado del backend (DRF) para mostrarlo en alertas.
 * Prioridad: detail > message/error/msg > non_field_errors > errores por campo >
 * mensaje de red > texto por estado HTTP > fallback genérico (última opción).
 */
export function serverErrorMsg(err: any, fallback: string): string {
  if (err?.name === 'TimeoutError') {
    return 'La operación tardó demasiado y se canceló. Revisa tu conexión o reintenta.';
  }
  const body = err?.error;
  const pick = (v: any): string | null => {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (Array.isArray(v)) {
      const s = v.map((x) => String(x ?? '').trim()).filter(Boolean).join(' | ');
      return s || null;
    }
    return null;
  };

  if (typeof body === 'string' && body.trim()) return body.trim();
  if (body && typeof body === 'object') {
    for (const k of ['detail', 'detalle', 'message', 'msg', 'error']) {
      const s = pick((body as any)[k]);
      if (s) return s;
    }
    const nfe = pick((body as any)['non_field_errors']);
    if (nfe) return nfe;
    // Errores por campo estilo DRF: {campo: ["msg", ...]}
    const parts: string[] = [];
    for (const [k, v] of Object.entries(body)) {
      const s = pick(v);
      if (s) parts.push(`${k}: ${s}`);
    }
    if (parts.length) return parts.join(' | ');
  }

  const httpMsg = typeof err?.message === 'string' && err.message.trim() ? err.message.trim() : '';
  const status = err?.status;
  if (status === 0) return 'Sin conexión con el servidor. Revisa tu internet.';
  if (status === 400 && httpMsg && !/^Http failure/.test(httpMsg)) return httpMsg;
  if (status === 401) return 'Sesión expirada. Vuelve a iniciar sesión.';
  if (status === 403) return 'Sin permiso para esta acción.';
  if (status === 404) return 'No encontrado en el servidor.';
  if (status === 413) return 'Archivo demasiado grande.';
  if (status === 422 && httpMsg && !/^Http failure/.test(httpMsg)) return httpMsg;
  if (typeof status === 'number' && status >= 500) {
    return `${fallback} (error ${status} del servidor)`;
  }
  if (httpMsg && !/^Http failure/.test(httpMsg)) return httpMsg;
  return fallback;
}
