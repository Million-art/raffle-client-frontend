"use client";

import { RaffleCard } from "@/components/raffles/RaffleCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
    raffles: any[];
}

export function LiveRafflesSection({ raffles }: Props) {
    return (
        <section className="w-full bg-[var(--color-slate-50)] py-24">
            <div className="mx-auto max-w-7xl px-4">

                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">

                    <div>
                        <h2 className="text-3xl font-bold text-[var(--color-slate-900)]">
                            Live Raffles
                        </h2>

                        <p className="text-slate-600 mt-2">
                            Join ongoing draws before tickets sell out.
                        </p>
                    </div>

                    <Link
                        href="/raffles"
                        className="flex items-center gap-2 text-[var(--brand-blue)] font-semibold"
                    >
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {raffles.map((raffle) => (
                        <RaffleCard key={raffle.id} raffle={raffle} />
                    ))}
                </div>

            </div>
        </section>
    );
}