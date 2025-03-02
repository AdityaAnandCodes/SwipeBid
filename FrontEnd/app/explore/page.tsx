"use client";
import ExplorePage from "@/components/ExplorePage";

import {
  WagmiProvider,
  QueryClientProvider,
  RainbowKitProvider,
  config,
  QueryClient,
} from "@/lib/wallet_utils";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
const queryClient = new QueryClient();

export default function Explore() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <main className="w-full min-h-screen relative flex flex-col gap-8">
            <Link
              href="/"
              className="absolute top-5 left-5 w-14 hover:scale-110 duration-300 transition-all"
            >
              <MoveLeft />
            </Link>
            <ExplorePage />
          </main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
