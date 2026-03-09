import { MousePointerClick } from "lucide-react";

export function HowItWorksSection() {
    const steps = [
        {
            description: "Explore our curated selection of raffles, pick your favourites, and purchase tickets securely through our encrypted checkout system.",
        },
        {
            description: "Purchase one or multiple entries to increase your chances of winning the prize.",
        },
        {
            description: "Explore our curated selection of raffles, pick your favourites, and purchase tickets securely through our encrypted checkout system.",
        },
        {
            description: "Explore our curated selection of raffles, pick your favourites, and purchase tickets securely through our encrypted checkout system.",
        },
    ];

    return (
        <section className="w-full bg-slate-50 py-32">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                
                <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
                    
                    {/* Left Column */}
                    <div className="flex flex-col items-start pt-4">
                        <div className="bg-[var(--brand-blue)] text-slate-900 font-semibold px-4 py-1.5 rounded-full text-sm mb-6">
                            How it works
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-[44px] font-semibold text-slate-800 leading-tight tracking-tight max-w-md">
                            Your journey to winning in four simple steps
                        </h2>
                    </div>

                    {/* Right Column (Steps Grid) */}
                    <div className="grid sm:grid-cols-2 gap-x-12 gap-y-16">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-start text-left">
                                <div className="h-[72px] w-[72px] bg-[#E3EBF3] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/50">
                                    <MousePointerClick className="h-7 w-7 text-[var(--brand-blue)]" />
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
}