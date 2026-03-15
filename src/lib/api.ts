const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

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
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401 && !_isRetry && !path.includes("/auth/refresh") && !path.includes("/auth/login")) {
    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
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

export { getErrorMessage } from "@raffle-hub/shared";


