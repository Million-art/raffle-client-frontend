import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaffleHub | Transparent & Verified Participation",
  description: "Join the most accountable and fair raffle platform. Verified draws, instant winnings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-slate-950 selection:bg-primary-500/30 selection:text-white antialiased">
        <Providers>
          <Navbar />
          {children}
          <footer className="border-t border-white/5 bg-slate-950 py-12">
            <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
              © {new Date().getFullYear()} RaffleHub. Built for Transparency.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
