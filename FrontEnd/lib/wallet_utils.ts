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

// const config1 = getDefaultConfig({
//   appName: "SwipeBid",
//   projectId: "18c1e26594a664a3ae0618730927fada",
//   chains: [lineaSepolia],
//   ssr: true, // If your dApp uses server side rendering (SSR)
// });

export { QueryClient, WagmiProvider, QueryClientProvider, RainbowKitProvider };

import { http, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";

// Create the Wagmi config with MetaMask connector
const config = createConfig({
  ssr: true,
  chains: [lineaSepolia],
  connectors: [metaMask()],
  transports: {
    [lineaSepolia.id]: http(),
  },
});

// Create a new QueryClient
const queryClient = new QueryClient();

// Export everything needed
export { config, queryClient };
