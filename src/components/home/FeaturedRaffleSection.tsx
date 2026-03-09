"use client";

import Image from "next/image";
import Link from "next/link";
import { Ticket, Clock } from "lucide-react";

type FeaturedRaffle = {
    id: string;
    title: string;
    description: string;
    image: string;
    ticketPrice: number;
    totalTickets: number;
    soldTickets: number;
    endDate: string;
};

interface Props {
    raffle: FeaturedRaffle;
}

export function FeaturedRaffleSection({ raffle }: Props) {
    const progress = (raffle.soldTickets / raffle.totalTickets) * 100;

    return (
        <section className="w-full bg-white py-24">
            <div className="mx-auto max-w-7xl px-4">

                <div className="grid md:grid-cols-2 gap-14 items-center">

                    {/* Image */}
                    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={raffle.image}
                            alt={raffle.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div>

                        <span className="inline-block text-sm font-semibold text-[var(--brand-blue)] mb-3">
                            Featured Raffle
                        </span>

                        <h2 className="text-4xl font-bold text-[var(--color-slate-900)] mb-4">
                            {raffle.title}
                        </h2>

                        <p className="text-slate-600 mb-6 leading-relaxed">
                            {raffle.description}
                        </p>

                        {/* Progress */}
                        <div className="mb-6">

                            <div className="flex justify-between text-sm mb-1">
                                <span>{raffle.soldTickets} tickets sold</span>
                                <span>{raffle.totalTickets}</span>
                            </div>

                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--brand-blue)]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-6 text-sm text-slate-600 mb-8">

                            <div className="flex items-center gap-2">
                                <Ticket className="h-4 w-4 text-[var(--brand-blue)]" />
                                ${raffle.ticketPrice} / ticket
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[var(--brand-blue)]" />
                                Ends {new Date(raffle.endDate).toLocaleDateString()}
                            </div>

                        </div>

                        {/* CTA */}
                        <Link
                            href={`/raffles/${raffle.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-blue)] px-6 py-3 text-white font-semibold hover:opacity-90 transition"
                        >
                            Enter Raffle
                        </Link>

                    </div>
                </div>

            </div>
        </section>
    );
}