const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
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
      // Attempt to refresh the token
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // Retry the original request
        return apiFetch(path, options, true);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    // Refresh failed or unauthorized - redirect to login
    if (!options.skipAuthRedirect && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { error?: string }).error || res.statusText;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}


