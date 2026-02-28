const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "API request failed");
  }

  return data as T;
}
