import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
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
      <body className="min-h-screen bg-slate-50 selection:bg-primary-100 selection:text-primary-900">
        <Navbar />
        {children}
        <footer className="border-t border-slate-200 bg-white py-12">
            <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} RaffleHub. Built for Transparency.
            </div>
        </footer>
      </body>
    </html>
  );
}
