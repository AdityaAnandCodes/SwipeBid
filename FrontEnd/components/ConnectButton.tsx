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
            className="px-4 py-2 bg-white text-black font-medium rounded-lg"
          >
            Connected Network
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
                  className="block w-full text-center px-4 py-2 rounded-lg text-gray-800 hover:bg-gray-100 transition-all duration-300"
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
            className="px-4 py-2 bg-white text-black font-medium rounded-lg"
          >
            {address?.slice(0, 5)}...{address?.slice(-4, address.length)}
          </button>
          {isAddressMenuOpen && (
            <div className="absolute mt-2 w-32 bg-white shadow-lg rounded-lg">
              <button
                onClick={() => disconnect()}
                className="block w-full px-4 py-2 text-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
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
      {connectors.map(
        (connector) =>
          connector.name === "MetaMask" && (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="bg-yellow-300 text-white text-base px-3 py-2 hover:scale-105 duration-300 font-semibold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
            >
              {isPending ? "Connecting..." : `Connect ${connector.name}`}
            </button>
          )
      )}
    </div>
  );
}
