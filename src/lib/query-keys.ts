/**
 * Centralized query keys for TanStack Query.
 * Enables consistent cache invalidation and prevents typos.
 */
export const queryKeys = {
  all: ["client"] as const,
  raffles: {
    all: () => [...queryKeys.all, "raffles"] as const,
    lists: () => [...queryKeys.raffles.all(), "list"] as const,
    list: (filters: { page?: number; limit?: number; liveOnly?: boolean }) =>
      [...queryKeys.raffles.lists(), filters] as const,
    details: () => [...queryKeys.raffles.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.raffles.details(), id] as const,
  },
  me: {
    raffles: (filters?: { page?: number; limit?: number; status?: string }) =>
      [...queryKeys.all, "me", "raffles", filters ?? {}] as const,
  },
  confirmations: {
    detail: (id: string) => [...queryKeys.all, "confirmations", id] as const,
  },
  notifications: {
    all: () => [...queryKeys.all, "notifications"] as const,
    list: (params?: { limit?: number; offset?: number }) =>
      [...queryKeys.notifications.all(), params ?? {}] as const,
    unreadCount: () => [...queryKeys.notifications.all(), "unread-count"] as const,
  },
} as const;
