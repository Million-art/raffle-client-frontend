"use client";

import { useCallback, useEffect, useState } from "react";
import { RaffleCard } from "@/components/raffles/RaffleCard";
import { getRaffles } from "@/services/raffles.service";
import type { RaffleListItem } from "@/services/raffles.service";
import { useRaffleListUpdates } from "@/hooks/useRaffleListUpdates";
import { Loader2 } from "lucide-react";

export function LiveRafflesSection() {
  const [items, setItems] = useState<RaffleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRaffles = useCallback(() => {
    setLoading(true);
    getRaffles({ page: 1, limit: 6, liveOnly: true })
      .then((r) => setItems(r.items))
      .catch(() => setError("Could not load raffles"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  useRaffleListUpdates(loadRaffles);

  if (loading) {
    return (
      <section className="w-full py-24 bg-slate-50">
        <div className="flex justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-24 bg-slate-50 text-center">
        <p className="text-lg font-semibold text-slate-700">{error}</p>
      </section>
    );
  }

  return (
    <section className="w-full py-24 bg-slate-50">
      <div className="container mx-auto max-w-7xl px-6">

        {/* Section Header */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            Featured <span className="text-brand-blue">Raffles</span>
          </h2>
          <p className="mt-3 text-slate-500">
            Participate and win amazing prizes.
          </p>
        </div>

        {/* Raffle Grid */}
        {items.length === 0 ? (
          <div className="text-center text-slate-500">
            No raffles available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((raffle) => (
              <RaffleCard
                key={raffle.id}
                raffle={raffle}
                detailHref={`/raffles/${raffle.id}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}