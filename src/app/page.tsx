import { HeroSection } from "@/components/home/HeroSection";
import { LiveRafflesSection } from "@/components/raffles/LiveRafflesSection";
import { WinnersSection } from "@/components/home/WinnersSection";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col justify-between">
            <HeroSection />

            <LiveRafflesSection />

            <WinnersSection />

            {/* Trust Banner / Social Proof */}
            <section className="w-full bg-slate-950 py-32 text-white overflow-hidden relative border-t border-white/5">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary-600/5 blur-[120px]" />
                    <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
                </div>

                <div className="container mx-auto flex max-w-7xl flex-col items-center px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 mb-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Accountability Protocol</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight sm:text-7xl text-white leading-tight">Built on the foundation of <span className="text-primary-500 italic">absolute transparency.</span></h2>
                    <p className="mt-8 max-w-3xl text-xl text-slate-400 leading-relaxed font-medium italic">
                        "Every ticket sale, every draw, and every payout is logged and publicly auditable. We don't just promise fairness; we prove it with cryptographic accountability."
                    </p>
                    <div className="mt-20 flex flex-wrap justify-center gap-12 sm:gap-24">
                        <div className="flex flex-col items-center">
                            <span className="text-6xl font-black text-white tracking-tighter">100%</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-4 font-black">Verified Nodes</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-6xl font-black text-white tracking-tighter">Real-time</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-4 font-black">Audit Trails</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-6xl font-black text-white tracking-tighter">Secure</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-4 font-black">Escrow Layer</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
