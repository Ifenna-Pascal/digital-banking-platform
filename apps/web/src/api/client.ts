// Small fetch wrapper for apps/api: adds the JSON headers and login token,
// and turns API errors ({ msg }) into thrown errors with a readable message.

const BASE_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:4000"
).replace(/\/$/, "");
const TOKEN_KEY = "banking_token";

export const tokenStore = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // storage blocked (private mode): the session lasts until the tab closes
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export interface ApiError extends Error {
  status: number;
}

const makeError = (message: string, status: number): ApiError =>
  Object.assign(new Error(message), { status });

let onUnauthorized: () => void = () => undefined;

// AuthProvider registers a logout here, so an expired session anywhere sends the user to login.
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export async function api<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {}
): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw makeError(
      "Can't reach the bank server. Check that the API is running.",
      0
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw makeError(data.msg || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";
