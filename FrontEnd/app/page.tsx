"use client";

import CreateNFTTutorial from "@/components/CreatedNFT";
import CTASection from "@/components/CTA";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import SwipeTutorial from "@/components/SwipeTutorial";
import {
  WagmiProvider,
  QueryClientProvider,
  RainbowKitProvider,
  config,
  QueryClient,
} from "@/lib/wallet_utils";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <main className="w-full min-h-screen relative flex flex-col gap-8">
            <Navbar />
            <Hero />
            <SwipeTutorial />
            <CreateNFTTutorial />
            <CTASection />
            <Footer />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
