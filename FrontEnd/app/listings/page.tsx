"use client";

import {
  WagmiProvider,
  QueryClientProvider,
  RainbowKitProvider,
  config,
  QueryClient,
} from "@/lib/wallet_utils";
import OwnerListingsPage from "@/components/OwnerListingsPage";

const queryClient = new QueryClient();

export default function Explore() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="w-full min-h-screen relative bg-gradient-to-b from-gray-900 to-black text-white">
          <OwnerListingsPage />
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
