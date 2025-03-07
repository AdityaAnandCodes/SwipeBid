"use client";

import {
  WagmiProvider,
  QueryClientProvider,
  RainbowKitProvider,
  config,
  QueryClient,
} from "@/lib/wallet_utils";
import BidderOwnedNFTsPage from "@/components/BidderOwnedNFTsPage";

const queryClient = new QueryClient();

export default function Explore() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <main className="w-full min-h-screen relative bg-gradient-to-b from-gray-900 to-black text-white">
            <BidderOwnedNFTsPage />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
