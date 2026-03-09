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
    const raffles = await getRaffles({ limit: 3, liveOnly: true }).catch(() => null);
    const featuredRaffles = raffles?.items ?? [];

    return (
        <div className="flex min-h-screen flex-col w-full">
            <HeroSection />
            <StatsSection />
            <LiveRafflesSection />
            {featuredRaffles.length > 0 && <FeaturedRaffleSection raffles={featuredRaffles} />}
            <HowItWorksSection />
            <BecomeAgentSection />
            <WinnersSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </div>
    );
}
