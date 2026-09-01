import { environment } from './environment';

export const API_URL = environment.production
  ? environment.URL_BASE
  : `http://${window.location.hostname}:8000`;
