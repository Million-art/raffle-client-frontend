import { RaffleCard } from "@/components/raffles/RaffleCard";
import { Search, Filter } from "lucide-react";

const DUMMY_RAFFLES = [
    {
        id: '1',
        name: 'Ultimate Gaming Rig 2024',
        description: 'RTX 4090, i9-14900K, 64GB RAM. The beast you deserve.',
        ticketPrice: 25.00,
        totalTickets: 1000,
        ticketsSold: 642,
        endDate: '2026-03-20',
        imageUrl: '',
        agentName: 'TechHub Ethiopia'
    },
    {
        id: '2',
        name: 'MacBook Pro M3 Max',
        description: 'The most powerful laptop for creators. 16-inch display, Space Black.',
        ticketPrice: 15.00,
        totalTickets: 500,
        ticketsSold: 124,
        endDate: '2026-04-10',
        imageUrl: '',
        agentName: 'AppleStore Addis'
    },
    {
        id: '3',
        name: 'iPhone 15 Pro Max',
        description: 'Titanium design, A17 Pro chip, Pro camera system.',
        ticketPrice: 5.00,
        totalTickets: 2000,
        ticketsSold: 1842,
        endDate: '2026-02-28',
        imageUrl: '',
        agentName: 'Global Electronics'
    },
    {
        id: '4',
        name: 'PlayStation 5 Slim',
        description: 'Disk Edition with 1TB SSD. Includes two DualSense controllers.',
        ticketPrice: 2.00,
        totalTickets: 3000,
        ticketsSold: 2100,
        endDate: '2026-03-05',
        imageUrl: '',
        agentName: 'GameZone ET'
    }
];

export default function RafflesPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-8 pb-24">
            <div className="container mx-auto max-w-7xl px-4">
                {/* Search & Filter Header */}
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Explore Raffles</h1>
                        <p className="mt-2 text-slate-500 font-medium">Browse through verified opportunities and find your next win.</p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by name or agent..."
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-50 outline-none"
                            />
                        </div>
                        <button className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
                            <Filter className="h-4 w-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {DUMMY_RAFFLES.map((raffle) => (
                        <RaffleCard key={raffle.id} raffle={raffle} />
                    ))}
                </div>

                {/* Empty State / More soon */}
                <div className="mt-24 flex flex-col items-center text-center opacity-60">
                    <div className="mb-4 h-px w-24 bg-slate-300" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">More Raffles Incoming Daily</p>
                </div>
            </div>
        </main>
    );
}
