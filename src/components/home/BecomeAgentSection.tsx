import Link from "next/link";

export function BecomeAgentSection() {
  return (
    <section className="bg-slate-50 py-24 px-4">

      <div className="max-w-5xl mx-auto bg-[var(--brand-blue)] rounded-3xl py-20 px-8 text-center shadow-lg">

        <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--brand-yellow)] mb-8 tracking-tight">
          Become an Agent
        </h2>

        <Link
          href="/agents/apply"
          className="inline-block bg-white text-[var(--brand-blue)] px-8 py-3.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all"
        >
          Become an agent
        </Link>

      </div>
    </section>
  );
}