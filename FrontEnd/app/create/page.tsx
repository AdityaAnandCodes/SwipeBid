"use client";
import CreateNFTPage from "@/components/CreateNFTPage";
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

const page = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CreateNFTPage />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default page;
