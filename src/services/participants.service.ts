import { apiFetch, type ApiResponse } from "@/lib/api";

export interface Participant {
    id: string;
    name: string;
    ticketCount: number;
    purchasedAt: string;
}

export interface ParticipantsResponse {
    participants: Participant[];
    total: number;
    page: number;
    limit: number;
}

export async function getRaffleParticipants(
    raffleId: string,
    page: number = 1,
    limit: number = 20
): Promise<ParticipantsResponse> {
    const response = await apiFetch<ApiResponse<ParticipantsResponse>>(
        `/api/raffles/${raffleId}/participants?page=${page}&limit=${limit}`
    );
    return response.data;
}
