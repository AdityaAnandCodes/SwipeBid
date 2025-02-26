"use client";
import ExplorePage from "@/components/ExplorePage";

import {
  WagmiProvider,
  QueryClientProvider,
  RainbowKitProvider,
  config,
  QueryClient,
} from "@/lib/wallet_utils";
const queryClient = new QueryClient();

export default function Explore() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <main className="w-full min-h-screen relative flex flex-col gap-8">
            <ExplorePage />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
