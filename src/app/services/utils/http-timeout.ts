import { HttpContextToken, HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, retry, throwError, timeout, timer } from 'rxjs';

/** Timeout por defecto de todo fetch: nada se queda en espera infinita. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
/** Techo de seguridad para overrides puntuales. */
const MAX_REQUEST_TIMEOUT_MS = 300000;

/** Override por petición: `new HttpContext().set(REQUEST_TIMEOUT_MS, 90000)`. */
export const REQUEST_TIMEOUT_MS = new HttpContextToken<number>(() => DEFAULT_REQUEST_TIMEOUT_MS);

/** Solo se reintenta automáticamente lo idempotente (GET) y solo ante
 *  errores de red (status 0) o del servidor (5xx). Nunca en POST/PUT/PATCH/DELETE
 *  para no duplicar operaciones (ventas, pagos, anulaciones). */
function esReintentable(err: any): boolean {
  if (err?.name === 'TimeoutError') return true;
  return err?.status === 0 || (typeof err?.status === 'number' && err.status >= 500);
}

@Injectable()
export class TimeoutRetryInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const raw = request.context.get(REQUEST_TIMEOUT_MS) ?? DEFAULT_REQUEST_TIMEOUT_MS;
    const ms = Math.min(Math.max(raw, 1000), MAX_REQUEST_TIMEOUT_MS);
    const segundos = Math.round(ms / 1000);

    let flujo = next.handle(request);
    if (request.method === 'GET') {
      flujo = flujo.pipe(
        retry({
          count: 2,
          delay: (error, reintento) =>
            esReintentable(error)
              ? timer(Math.min(1000 * 2 ** (reintento - 1), 4000))
              : throwError(() => error),
        })
      );
    }
    return flujo.pipe(
      timeout(ms),
      catchError((err: any) =>
        err?.name === 'TimeoutError'
          ? throwError(
              () =>
                new HttpErrorResponse({
                  error: {
                    detail: `La petición tardó más de ${segundos} segundos y se canceló. Revisa tu conexión o reintenta.`,
                  },
                  status: 0,
                  statusText: 'Timeout',
                  url: request.urlWithParams,
                })
            )
          : throwError(() => err)
      )
    );
  }
}
