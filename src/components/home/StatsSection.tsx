import { Users, Ticket, Trophy, ShieldCheck } from "lucide-react";

export function StatsSection() {
  const stats = [
    { icon: Users, label: "Active Players", value: "12,400+" },
    { icon: Ticket, label: "Tickets Sold", value: "250,000+" },
    { icon: Trophy, label: "Winners", value: "1,820+" },
    { icon: ShieldCheck, label: "Verified Raffles", value: "320+" },
  ];

  return (
    <section className="bg-[var(--color-slate-50)] py-20">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid md:grid-cols-4 gap-8 text-center">

          {stats.map((stat, i) => {
            const Icon = stat.icon;

            return (
              <div key={i} className="p-6 bg-white rounded-xl shadow-sm">

                <Icon className="mx-auto mb-4 h-8 w-8 text-[var(--brand-blue)]" />

                <p className="text-3xl font-bold text-[var(--color-slate-900)]">
                  {stat.value}
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  {stat.label}
                </p>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}