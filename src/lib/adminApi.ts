import type { Product } from './productParser';

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

export async function apiLogin(username: string, password: string): Promise<{ token: string; expiresIn: number }> {
  const res = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
}

export async function apiGetProducts(): Promise<{ products: Product[]; sha: string }> {
  const res = await fetch(`${API_BASE}/products`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function apiSaveProducts(products: Product[], sha: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ products, sha }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save products');
  }
}

export interface LibertaOverrides {
  [productId: string]: {
    price?: number;
    salePrice?: number;
    categories?: string[];
    hidden?: boolean;
  };
}

export async function apiGetOverrides(): Promise<{ overrides: LibertaOverrides; sha: string }> {
  const res = await fetch(`${API_BASE}/overrides`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load overrides');
  return res.json();
}

export async function apiSaveOverrides(overrides: LibertaOverrides, sha: string): Promise<void> {
  const res = await fetch(`${API_BASE}/overrides`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ overrides, sha }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save overrides');
  }
}
