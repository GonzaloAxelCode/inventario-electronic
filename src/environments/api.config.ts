import { environment } from './environment';

export const API_URL = environment.production
  ? environment.URL_BASE
  : `http://${window.location.hostname}:8000`;

export function imageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_URL + (path.startsWith('/') ? path : '/' + path);
}
