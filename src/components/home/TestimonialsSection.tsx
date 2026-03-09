import Image from "next/image";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Daniel M.",
      quote: "I won a PlayStation after just 3 tickets. The process was transparent and exciting!",
      image: "/testimonials/user1.jpg",
    },
    {
      name: "Sarah K.",
      quote: "The platform is super easy to use and the raffles are actually fair.",
      image: "/testimonials/user2.jpg",
    },
    {
      name: "Michael B.",
      quote: "Best raffle site I’ve used. I’ve already won twice!",
      image: "/testimonials/user3.jpg",
    },
  ];

  return (
    <section className="bg-white py-24">

      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-3xl font-bold text-center text-[var(--color-slate-900)] mb-14">
          What Our Winners Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 border rounded-xl bg-[var(--color-slate-50)]"
            >
              <p className="text-slate-600 mb-6">
                “{t.quote}”
              </p>

              <div className="flex items-center gap-3">

                <Image
                  src={t.image}
                  width={40}
                  height={40}
                  alt={t.name}
                  className="rounded-full"
                />

                <span className="font-semibold text-sm">
                  {t.name}
                </span>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}