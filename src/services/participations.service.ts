import { apiFetch, type ApiResponse } from "@/lib/api";

export interface Participation {
  raffleId: string;
  raffleName: string;
  description: string;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  myTickets: number;
  status: string;
  imageUrl?: string;
  videoUrl?: string;
  agentName?: string;
  winnerId?: string;
}

export interface MyRafflesResponse {
  raffles: Participation[];
}

export async function getMyRaffles(): Promise<Participation[]> {
  const response = await apiFetch<ApiResponse<MyRafflesResponse>>("/api/me/raffles");
  return response.data.raffles;
}
