const API_Base = process.env.NEXT_PUBLIC_API_URL;

export async function fetchAPI<T>(
  endpoint: string,
  body?: unknown,
  method: 'GET' | 'POST' | 'DELETE' = 'POST'
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'DELETE')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_Base}${endpoint}`, options);

  if (response.status === 401) {
    // Redirect to login if unauthorized
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}
