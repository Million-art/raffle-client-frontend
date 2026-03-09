import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { LiveRafflesSection } from "@/components/raffles/LiveRafflesSection";
import { FeaturedRaffleSection } from "@/components/home/FeaturedRaffleSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { BecomeAgentSection } from "@/components/home/BecomeAgentSection";
import { WinnersSection } from "@/components/home/WinnersSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { CTASection } from "@/components/home/CTASection";
import { getRaffles } from "@/services/raffles.service";

export default async function Home() {
    const raffles = await getRaffles({ limit: 1, liveOnly: true }).catch(() => null);
    const featuredApi = raffles?.items?.[0];

    const featuredRaffle = featuredApi ? {
        id: featuredApi.id,
        title: featuredApi.name,
        description: featuredApi.description,
        image: featuredApi.imageUrl || "/images/device.png",
        ticketPrice: featuredApi.ticketPrice,
        totalTickets: featuredApi.totalTickets,
        soldTickets: featuredApi.ticketsSold,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Feature raffles don't currently have endDate in list API
    } : null;

    return (
        <div className="flex min-h-screen flex-col w-full">
            <HeroSection />
            <StatsSection />
            <LiveRafflesSection />
            {featuredRaffle && <FeaturedRaffleSection raffle={featuredRaffle} />}
            <HowItWorksSection />
            <BecomeAgentSection />
            <WinnersSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </div>
    );
}
