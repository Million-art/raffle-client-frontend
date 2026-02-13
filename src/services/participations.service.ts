import { apiFetch } from "@/lib/api";

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
  agentName?: string;
}

export interface MyRafflesResponse {
  raffles: Participation[];
}

export async function getMyRaffles(): Promise<Participation[]> {
  const data = await apiFetch<MyRafflesResponse>("/api/me/raffles");
  return data.raffles;
}
