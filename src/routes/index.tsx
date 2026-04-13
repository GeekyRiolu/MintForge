import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FreeTradingSection } from "@/components/FreeTradingSection";
import { IdentitySection } from "@/components/IdentitySection";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NFT.com — Own Your NFT Identity" },
      { name: "description", content: "Build your brand with an NFT that is uniquely you. Free trading on the NFT.com Marketplace." },
      { property: "og:title", content: "NFT.com — Own Your NFT Identity" },
      { property: "og:description", content: "Build your brand with an NFT that is uniquely you." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FreeTradingSection />
      <IdentitySection />
      <Footer />
    </div>
  );
}
