// INTENTIONAL: insecure HTTP service layer
// No CSRF tokens, no schema validation, minimal error handling

const API_BASE = import.meta.env.VITE_API_URL || '';

// INTENTIONAL: token stored in localStorage (not HttpOnly cookie)
function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // INTENTIONAL: no retry logic, no timeout
  const data = await response.json();
  return data;
}

export const http = {
  get: (url: string) => request(url),
  post: (url: string, body: any) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => request(url, { method: 'DELETE' }),
};

export default http;
