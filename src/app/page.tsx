import { HeroSection } from "@/components/home/HeroSection";
import { RaffleCard } from "@/components/raffles/RaffleCard";
import { WinnersSection } from "@/components/home/WinnersSection";

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
    }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSection />
      
      {/* Featured Raffles section */}
      <section className="w-full bg-slate-50 py-24">
         <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Live Raffles</h2>
                    <p className="mt-4 text-lg text-slate-500 font-medium">Join our verified active raffles and win big with absolute fairness.</p>
                </div>
                <button className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-soft border border-slate-200 transition-all hover:bg-slate-50 sm:mt-0">
                    See All Raffles
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {DUMMY_RAFFLES.map((raffle) => (
                    <RaffleCard key={raffle.id} raffle={raffle} />
                ))}
            </div>
         </div>
      </section>

      <WinnersSection />

      {/* Trust Banner / Social Proof */}
      <section className="w-full bg-slate-900 py-24 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 h-full w-full opacity-10 pointer-events-none">
              <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full border border-white/20" />
              <div className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full border border-white/10" />
          </div>

          <div className="container mx-auto flex max-w-7xl flex-col items-center px-4 text-center relative z-10">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Built on the foundation of trust.</h2>
              <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed font-medium">
                  Every ticket sales, every draw, and every payout is logged and publicly auditable. We don't just promise fairness; we prove it with cryptographic accountability.
              </p>
              <div className="mt-16 flex flex-wrap justify-center gap-12 sm:gap-20">
                  <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-primary-400 tracking-tight">100%</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-3 font-black">Verified Draws</span>
                  </div>
                  <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-primary-400 tracking-tight">Real-time</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-3 font-black">Audit Trails</span>
                  </div>
                  <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-primary-400 tracking-tight">Secure</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-3 font-black">Escrow Layer</span>
                  </div>
              </div>
          </div>
      </section>
    </main>
  );
}
