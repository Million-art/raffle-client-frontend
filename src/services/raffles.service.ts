import { apiFetch, type ApiResponse } from "@/lib/api";

export interface RaffleListItem {
  id: string;
  name: string;
  description: string;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  videoUrl?: string;
  imageUrl?: string;
  agentName?: string;
}

export interface RafflesListResponse {
  items: RaffleApiItem[];
  total: number;
  page: number;
  limit: number;
}

/** Raw shape from admin API (via client-backend proxy) */
interface RaffleApiItem {
  id: string;
  name: string;
  description?: string;
  status?: string;
  totalTickets: number;
  ticketPrice: number;
  ticketsSold?: number;
  startDate?: string | null;
  videoUrl?: string;
  imageUrl?: string;
  agent?: { displayName?: string };
  createdAt?: string;
}

function mapApiItemToCard(item: RaffleApiItem): RaffleListItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    ticketPrice: item.ticketPrice,
    totalTickets: item.totalTickets,
    ticketsSold: item.ticketsSold ?? 0,
    imageUrl: item.imageUrl,
    videoUrl: item.videoUrl,
    agentName: item.agent?.displayName,
  };
}

export async function getRaffles(options?: {
  page?: number;
  limit?: number;
  liveOnly?: boolean;
}): Promise<{ items: RaffleListItem[]; total: number; page: number; limit: number }> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const liveOnly = options?.liveOnly ?? false;
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (liveOnly) params.set("live_only", "true");

  const response = await apiFetch<ApiResponse<RafflesListResponse>>(
    `/api/raffles?${params.toString()}`
  );
  const data = response.data;

  return {
    items: (data.items ?? []).map(mapApiItemToCard),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? limit,
  };
}

/** Media item for product gallery */
export interface RaffleMediaItem {
  url: string;
  type: "image" | "video";
}

/** Full raffle details for the detail page (single public raffle by ID). */
export interface RaffleDetail {
  id: string;
  name: string;
  description: string;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  startDate?: string;
  videoUrl?: string;
  imageUrl?: string;
  media?: RaffleMediaItem[];
  agentName?: string;
  status?: string;
  createdAt?: string;
  winnerId?: string;
  winnerName?: string;
  winnerEmail?: string;
  winnerPhone?: string;
}

/** Raw single raffle from API (admin shape). */
interface RaffleDetailApiRaffle {
  id: string;
  name: string;
  description?: string;
  status?: string;
  totalTickets: number;
  ticketPrice: number;
  startDate?: string | null;
  videoUrl?: string;
  imageUrl?: string;
  media?: RaffleMediaItem[];
  agent?: { displayName?: string };
  createdAt?: string;
  winnerId?: string;
  winnerName?: string;
  winnerEmail?: string;
  winnerPhone?: string;
}

interface RaffleDetailResponse {
  raffle?: RaffleDetailApiRaffle;
  ticketsSold?: number;
  data?: { raffle?: RaffleDetailApiRaffle; ticketsSold?: number };
}

function mapDetailResponse(r: RaffleDetailApiRaffle, ticketsSold: number): RaffleDetail {
  const startDate = r.startDate
    ? new Date(r.startDate).toISOString().slice(0, 10)
    : undefined;
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    ticketPrice: r.ticketPrice,
    totalTickets: r.totalTickets,
    ticketsSold: ticketsSold ?? 0,
    startDate,
    imageUrl: r.imageUrl,
    videoUrl: r.videoUrl,
    media: r.media,
    agentName: r.agent?.displayName,
    status: r.status,
    createdAt: r.createdAt,
    winnerId: r.winnerId,
    winnerName: r.winnerName,
    winnerEmail: r.winnerEmail,
    winnerPhone: r.winnerPhone,
  };
}

export async function getRaffleById(id: string): Promise<RaffleDetail> {
  const response = await apiFetch<ApiResponse<{ raffle?: RaffleDetailApiRaffle; ticketsSold?: number }>>(
    `/api/raffles/${id}`
  );
  const data = response.data;
  const raffle = data.raffle;
  const ticketsSold = data.ticketsSold ?? 0;

  if (!raffle || typeof raffle !== "object") throw new Error("Raffle not found");
  return mapDetailResponse(raffle, ticketsSold);
}

/** Purchase tickets for a raffle (requires auth). Pass participantName/participantEmail for admin display. */
export async function purchaseTickets(
  raffleId: string,
  quantity: number,
  transactionId?: string,
  participantName?: string,
  participantEmail?: string,
  participantPhone?: string
): Promise<{ raffle_id: string; participant_id: string; quantity: number; checkout_url?: string }> {
  const body: { quantity: number; transaction_id?: string; participant_name?: string; participant_email?: string; participant_phone?: string } = { quantity };
  if (transactionId) body.transaction_id = transactionId;
  if (participantName) body.participant_name = participantName;
  if (participantEmail) body.participant_email = participantEmail;
  if (participantPhone) body.participant_phone = participantPhone;

  const response = await apiFetch<ApiResponse<{ raffle_id: string; participant_id: string; quantity: number; checkout_url?: string }>>(
    `/api/raffles/${raffleId}/purchase`, {
    method: "POST",
    body: JSON.stringify(body),
  }
  );
  return response.data;
}

/** A raffle the authenticated participant has joined */
export interface MyRaffle {
  raffleId: string;
  raffleName: string;
  description: string;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  myTickets: number;
  status: "active" | "locked" | "executed" | string;
  imageUrl?: string;
  videoUrl?: string;
  agentName?: string;
  winnerId?: string;
  winnerName?: string;
  winnerEmail?: string;
  winnerPhone?: string;
  joinedAt: string;
  confirmationId?: string;
  confirmationStatus?: "pending" | "confirmed" | "manually_verified" | "not_delivered" | "auto_7day" | string;
}

/** Fetch the authenticated user's raffle participations */
export async function getMyRaffles(options?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ raffles: MyRaffle[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.status) params.set("status", options.status);

  const response = await apiFetch<ApiResponse<{ raffles: MyRaffle[]; total: number }>>(
    `/api/me/raffles${params.toString() ? "?" + params.toString() : ""}`
  );
  return {
    raffles: response.data?.raffles ?? [],
    total: response.data?.total ?? 0
  };
}

/** Confirm prize receipt and provide feedback */
export async function confirmPrize(
  confirmationId: string,
  data: {
    prizeReceived: boolean;
    prizeMatches: boolean;
    rating: number;
    feedback: string;
  }
): Promise<void> {
  await apiFetch<ApiResponse<void>>(
    `/api/confirmations/${confirmationId}/confirm`,
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );
}

/** Fetch a single confirmation by ID */
export async function getConfirmation(confirmationId: string): Promise<MyRaffle> {
  const response = await apiFetch<ApiResponse<{ data: MyRaffle }>>(
    `/api/confirmations/${confirmationId}`
  );
  return response.data.data;
}
