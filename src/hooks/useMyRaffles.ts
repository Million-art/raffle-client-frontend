"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyRaffles, type MyRaffle } from "@/services/raffles.service";
import { queryKeys } from "@/lib/query-keys";

interface UseMyRafflesOptions {
  page?: number;
  limit?: number;
  status?: string;
  enabled?: boolean;
}

interface UseMyRafflesResult {
  raffles: MyRaffle[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMyRaffles(options: UseMyRafflesOptions = {}): UseMyRafflesResult {
  const { page = 1, limit = 10, status, enabled = true } = options;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.me.raffles({ page, limit, status }),
    queryFn: () => getMyRaffles({ page, limit, status }),
    enabled,
  });

  return {
    raffles: data?.raffles ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
