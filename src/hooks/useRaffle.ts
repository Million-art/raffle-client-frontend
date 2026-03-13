"use client";

import { useQuery } from "@tanstack/react-query";
import { getRaffleById } from "@/services/raffles.service";
import { queryKeys } from "@/lib/query-keys";

interface UseRaffleResult {
  raffle: Awaited<ReturnType<typeof getRaffleById>> | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useRaffle(id: string | undefined | null): UseRaffleResult {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.raffles.detail(id ?? ""),
    queryFn: () => getRaffleById(id!),
    enabled: !!id,
  });

  return {
    raffle: data ?? null,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
