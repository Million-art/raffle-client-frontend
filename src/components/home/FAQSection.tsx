"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "How are winners selected?",
      answer: "Through a secure randomized system that ensures complete fairness and transparency for every draw.",
    },
    {
      question: "Can I buy multiple tickets?",
      answer: "Yes, you can purchase as many tickets as you like to increase your chances of winning.",
    },
    {
      question: "How will I receive my prize?",
      answer: "Winners are contacted immediately and prizes are delivered or transferred securely to your designated account.",
    },
    {
      question: "Is it easy to use for beginners?",
      answer: "Absolutely! Our platform is designed to be intuitive and user-friendly for everyone.",
    },
    {
      question: "Are payments safe?",
      answer: "Yes, all transactions are secured and encrypted. We use industry-standard payment gateways to ensure your safety.",
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-slate-50 min-h-screen flex flex-col justify-center py-24">

      <div className="max-w-4xl mx-auto px-4 w-full">

        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-[var(--color-slate-900)] tracking-tight">
          Frequently Asked <span className="text-[var(--brand-blue)]">Questions</span>
        </h2>

        <div className="space-y-4 max-w-3xl mx-auto">

          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-lg text-slate-900">{faq.question}</h3>
                  {isOpen ? (
                    <X className="h-5 w-5 text-orange-400" strokeWidth={2.5} />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-500" strokeWidth={2.5} />
                  )}
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}