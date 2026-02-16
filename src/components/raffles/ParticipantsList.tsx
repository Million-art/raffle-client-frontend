"use client";

import React, { useEffect, useState } from 'react';
import { Users, Loader2, Ticket } from 'lucide-react';
import { getRaffleParticipants, type Participant } from '@/services/participants.service';
import { Pagination } from '@/components/ui/Pagination';

interface ParticipantsListProps {
    raffleId: string;
    className?: string;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ raffleId, className = '' }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        loadParticipants();
    }, [raffleId, currentPage]);

    const loadParticipants = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRaffleParticipants(raffleId, currentPage, limit);
            setParticipants(data.participants);
            setTotal(data.total);
            setTotalPages(Math.ceil(data.total / limit));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    if (loading && currentPage === 1) {
        return (
            <div className={`flex min-h-[200px] items-center justify-center ${className}`}>
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500 relative" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400 ${className}`}>
                <p className="font-semibold">Failed to load participants</p>
                <p className="mt-1 text-sm opacity-90">{error}</p>
            </div>
        );
    }

    if (participants.length === 0) {
        return (
            <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center ${className}`}>
                <Users className="mx-auto h-12 w-12 text-slate-500" />
                <h3 className="mt-4 text-lg font-bold text-white">No participants yet</h3>
                <p className="mt-2 text-sm text-slate-400">
                    Be the first to join this raffle!
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-500" />
                    Participants ({total})
                </h3>
            </div>

            <div className="space-y-2">
                {participants.map((participant) => (
                    <div
                        key={participant.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20 text-primary-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">
                                    {participant.name || 'Anonymous'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {new Date(participant.purchasedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-primary-600/20 px-3 py-1.5 text-primary-400">
                            <Ticket className="h-4 w-4" />
                            <span className="text-sm font-bold">{participant.ticketCount}</span>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    className="mt-6"
                />
            )}

            {loading && currentPage > 1 && (
                <div className="mt-4 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                </div>
            )}
        </div>
    );
};
