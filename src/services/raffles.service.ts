import { apiFetch } from "@/lib/api";

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

/** Admin API wraps payload in { success, message, data } */
interface AdminRafflesResponse {
  success?: boolean;
  data?: RafflesListResponse;
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
  const raw = await apiFetch<RafflesListResponse | AdminRafflesResponse>(
    `/api/raffles?${params.toString()}`
  );
  // Support both client-backend shape { items, total, ... } and admin shape { data: { items, total, ... } }
  const data =
    "data" in raw && raw.data != null
      ? (raw as AdminRafflesResponse).data!
      : (raw as RafflesListResponse);
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
  };
}

export async function getRaffleById(id: string): Promise<RaffleDetail> {
  const raw = await apiFetch<RaffleDetailResponse & { data?: { raffle?: RaffleDetailApiRaffle; ticketsSold?: number } }>(
    `/api/raffles/${id}`
  );
  // Client-backend returns { raffle, ticketsSold }; admin wrapper would be { data: { raffle, ticketsSold } }
  const data =
    raw.data != null && typeof raw.data === "object" && "raffle" in raw.data
      ? raw.data
      : raw;
  const raffle = (data as { raffle?: RaffleDetailApiRaffle }).raffle;
  const ticketsSold = (data as { ticketsSold?: number }).ticketsSold ?? 0;
  if (!raffle || typeof raffle !== "object") throw new Error("Raffle not found");
  return mapDetailResponse(raffle, ticketsSold);
}

/** Purchase tickets for a raffle (requires auth). Pass participantName/participantEmail for admin display. */
export async function purchaseTickets(
  raffleId: string,
  quantity: number,
  transactionId?: string,
  participantName?: string,
  participantEmail?: string
): Promise<{ raffle_id: string; participant_id: string; quantity: number }> {
  const body: { quantity: number; transaction_id?: string; participant_name?: string; participant_email?: string } = { quantity };
  if (transactionId) body.transaction_id = transactionId;
  if (participantName) body.participant_name = participantName;
  if (participantEmail) body.participant_email = participantEmail;
  const res = await apiFetch<{
    success?: boolean;
    data?: { raffle_id: string; participant_id: string; quantity: number };
    raffle_id?: string;
    participant_id?: string;
    quantity?: number;
  }>(`/api/raffles/${raffleId}/purchase`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = res.data;
  if (data && typeof data.raffle_id !== "undefined") return data;
  if (typeof (res as { raffle_id?: string }).raffle_id !== "undefined")
    return { raffle_id: res.raffle_id!, participant_id: res.participant_id!, quantity: res.quantity! };
  throw new Error("Invalid purchase response");
}
