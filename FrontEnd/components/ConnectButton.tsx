"use client";
import { useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useChains,
  useSwitchChain,
} from "wagmi";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const [isAddressMenuOpen, setIsAddressMenuOpen] = useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);

  const toggleAddressMenu = () => {
    setIsAddressMenuOpen(!isAddressMenuOpen);
    setIsNetworkMenuOpen(false);
  };

  const toggleNetworkMenu = () => {
    setIsNetworkMenuOpen(!isNetworkMenuOpen);
    setIsAddressMenuOpen(false);
  };

  if (isConnected) {
    return (
      <div className="flex space-x-2">
        {/* Network Dropdown */}
        <div className="relative">
          <button
            onClick={toggleNetworkMenu}
            className="px-4 py-2 bg-purple-500 text-white font-medium rounded-lg"
          >
            Network
          </button>
          {isNetworkMenuOpen && (
            <div className="absolute mt-2 w-40 bg-white shadow-lg rounded-lg">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    switchChain({ chainId: chain.id });
                    setIsNetworkMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  {chain.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Address Dropdown */}
        <div className="relative">
          <button
            onClick={toggleAddressMenu}
            className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg"
          >
            {address?.slice(0, 5)}...
          </button>
          {isAddressMenuOpen && (
            <div className="absolute mt-2 w-32 bg-white shadow-lg rounded-lg">
              <button
                onClick={() => disconnect()}
                className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}
