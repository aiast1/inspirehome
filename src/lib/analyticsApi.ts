const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AnalyticsOverview {
  pageViews: number;
  visitors: number;
  sessions: number;
  avgDuration: number;
  bounceRate: number;
}

export interface PageData {
  path: string;
  views: number;
  users: number;
}

export interface SourceData {
  source: string;
  sessions: number;
  users: number;
}

export interface CountryData {
  country: string;
  sessions: number;
  users: number;
}

export interface DeviceData {
  device: string;
  sessions: number;
}

async function fetchReport<T>(reportType: string, startDate: string, endDate: string): Promise<T> {
  const res = await fetch(`${API_BASE}/analytics`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ reportType, startDate, endDate }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.code || data.error || 'Analytics fetch failed');
  }
  return res.json();
}

export function fetchOverview(startDate: string, endDate: string) {
  return fetchReport<AnalyticsOverview>('overview', startDate, endDate);
}

export function fetchPages(startDate: string, endDate: string) {
  return fetchReport<PageData[]>('pages', startDate, endDate);
}

export function fetchSources(startDate: string, endDate: string) {
  return fetchReport<SourceData[]>('sources', startDate, endDate);
}

export function fetchCountries(startDate: string, endDate: string) {
  return fetchReport<CountryData[]>('countries', startDate, endDate);
}

export function fetchDevices(startDate: string, endDate: string) {
  return fetchReport<DeviceData[]>('devices', startDate, endDate);
}
