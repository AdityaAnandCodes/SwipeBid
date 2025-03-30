import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  mantleSepoliaTestnet,
  lineaSepolia,
  lineaTestnet,
  arbitrumSepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "SwipeBid",
  projectId: "18c1e26594a664a3ae0618730927fada",
  chains: [lineaSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export {
  config,
  QueryClient,
  WagmiProvider,
  QueryClientProvider,
  RainbowKitProvider,
};
