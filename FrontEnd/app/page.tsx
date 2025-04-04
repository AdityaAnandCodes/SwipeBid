"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import CreateNFTTutorial from "@/components/CreatedNFT";
import CTASection from "@/components/CTA";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import SwipeTutorial from "@/components/SwipeTutorial";
import { config, queryClient, WagmiProvider } from "@/lib/wallet_utils";

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="w-full max-sm:overflow-hidden min-h-screen relative flex flex-col gap-8 max-sm:gap-4">
          <Navbar />
          <Hero />
          <SwipeTutorial />
          <CreateNFTTutorial />
          <CTASection />
          <Footer />
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
