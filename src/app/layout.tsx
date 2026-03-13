import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { DrawToastNotification } from "@/components/raffles/DrawToastNotification";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carra Market",
  description: "Join the most accountable and fair raffle platform. Verified draws, instant winnings.",
  icons: {
    icon: "/carramarket.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-white selection:bg-brand-blue/10 selection:text-brand-blue antialiased flex flex-col">
        <ErrorBoundary>
          <Providers>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Toaster position="top-right" richColors />
            <DrawToastNotification />
            <Footer />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

