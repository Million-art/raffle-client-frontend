"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getRaffles, type RaffleListItem } from "@/services/raffles.service";
import { queryKeys } from "@/lib/query-keys";
import { wsClient } from "@/lib/websocket";

interface UseRafflesOptions {
  page?: number;
  limit?: number;
  liveOnly?: boolean;
}

interface UseRafflesResult {
  items: RaffleListItem[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useRaffles(options: UseRafflesOptions = {}): UseRafflesResult {
  const { page = 1, limit = 20, liveOnly = false } = options;

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.raffles.list({ page, limit, liveOnly }),
    queryFn: () => getRaffles({ page, limit, liveOnly }),
  });

  // Invalidate raffles list when new raffle is approved (WebSocket)
  useEffect(() => {
    if (!wsClient) return;
    const unsub = wsClient.on("raffle_approved", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raffles.lists() });
    });
    return () => unsub();
  }, [queryClient]);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
