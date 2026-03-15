const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

/** Fetch and cache CSRF token. Required for POST/PUT/DELETE/PATCH. */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = fetch(`${API_BASE}/api/csrf-token`, { credentials: "include" })
      .then((r) => r.json())
      .then((r) => (r.data?.token as string) || "")
      .then((t) => {
        csrfToken = t;
        return t;
      });
  }
  return csrfPromise;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

/** Extract user-facing error message from API error response */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (typeof o.message === "string" && o.message) return o.message;
    if (typeof o.error === "string" && o.error) return o.error;
  }
  return fallback;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuthRedirect?: boolean } = {},
  _isRetry = false
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const isStateChange = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (isStateChange) {
    const token = await getCsrfToken();
    if (token) headers["X-CSRF-Token"] = token;
  }

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && !_isRetry && !path.includes("/auth/refresh") && !path.includes("/auth/login")) {
    try {
      const csrf = await getCsrfToken();
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: csrf ? { "X-CSRF-Token": csrf } : undefined,
      });

      if (refreshRes.ok) {
        return apiFetch(path, options, true);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    if (!options.skipAuthRedirect && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = extractErrorMessage(body, res.statusText);
    const code = body && typeof body === "object" && "error" in body && typeof (body as { error?: string }).error === "string"
      ? (body as { error: string }).error
      : undefined;
    throw new ApiError(message, res.status, code);
  }

  return res.json() as Promise<T>;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}


