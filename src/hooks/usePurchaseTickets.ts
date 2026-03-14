"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseTickets } from "@/services/raffles.service";
import { queryKeys } from "@/lib/query-keys";

interface PurchaseParams {
  raffleId: string;
  quantity: number;
  participantName?: string;
  participantEmail?: string;
  participantPhone?: string;
}

interface PurchaseResult {
  checkout_url?: string;
  raffle_id: string;
  participant_id: string;
  quantity: number;
}

export function usePurchaseTickets() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: PurchaseParams): Promise<PurchaseResult> => {
      return purchaseTickets(
        params.raffleId,
        params.quantity,
        undefined,
        params.participantName,
        params.participantEmail,
        params.participantPhone
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raffles.detail(variables.raffleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.me.raffles() });
    },
  });

  return mutation;
}
