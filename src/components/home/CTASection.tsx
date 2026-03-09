import Link from "next/link";

export function CTASection() {
    return (
        <section className="w-full bg-[var(--brand-blue)] min-h-[70vh] flex flex-col justify-center text-center py-20 px-4">
            <div className="mx-auto max-w-4xl w-full flex flex-col items-center">

                <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                    Ready to try your luck?
                </h2>

                <p className="text-xl md:text-2xl text-blue-50 font-medium mb-12 max-w-2xl leading-relaxed">
                    Explore live raffles and win amazing prizes today on the most transparent platform.
                </p>

                <Link
                    href="/raffles"
                    className="inline-flex items-center justify-center bg-white text-[var(--brand-blue)] font-bold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                    Browse Raffles
                </Link>

            </div>
        </section>
    );
}