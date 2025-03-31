"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useChains,
  useSwitchChain,
} from "wagmi";
import {
  Wallet,
  Copy,
  ExternalLink,
  ChevronDown,
  Network,
  Check,
  LogOut,
  Loader2,
  AlertCircle,
  LinkIcon,
  X,
} from "lucide-react";
import MetaMaskLogo from "./MetaMaskLogo";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [isAddressMenuOpen, setIsAddressMenuOpen] = useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Find the current network details
  const currentNetwork = chains.find((chain) => chain.id === chainId);

  // Handle error state
  useEffect(() => {
    if (error) {
      setErrorMessage(error.message.replace(/\.$/, ""));
      setShowError(true);

      // Auto dismiss error after 5 seconds
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAddressMenuOpen || isNetworkMenuOpen) {
        const target = event.target as Node;
        if (
          target instanceof Element &&
          !target.closest(".dropdown-container")
        ) {
          setIsAddressMenuOpen(false);
          setIsNetworkMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddressMenuOpen, isNetworkMenuOpen]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open explorer in new tab
  const openExplorer = () => {
    if (address && currentNetwork?.blockExplorers?.default?.url) {
      window.open(
        `${currentNetwork.blockExplorers.default.url}/address/${address}`,
        "_blank"
      );
    }
  };

  const toggleAddressMenu = () => {
    setIsAddressMenuOpen(!isAddressMenuOpen);
    setIsNetworkMenuOpen(false);
  };

  const toggleNetworkMenu = () => {
    setIsNetworkMenuOpen(!isNetworkMenuOpen);
    setIsAddressMenuOpen(false);
  };

  // Network icon color mapping
  const getNetworkColor = (chainId: number): string => {
    const networkColors: Record<number, string> = {
      1: "#627EEA", // Ethereum
      137: "#8247E5", // Polygon
      56: "#F3BA2F", // BSC
      42161: "#2D374B", // Arbitrum
      10: "#FF0420", // Optimism
      43114: "#E84142", // Avalanche
    };

    return networkColors[chainId] || "#888888";
  };

  if (isConnected) {
    return (
      <>
        {/* Error Toast - Fixed Position */}
        {showError && (
          <div className="fixed top-4 right-4 z-50 flex items-center text-red-500 text-sm bg-red-100 px-4 py-3 rounded-md shadow-md animate-in fade-in slide-in-from-top-5 duration-300">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={() => setShowError(false)}
              className="ml-3 p-1 hover:bg-red-200 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex space-x-3">
          {/* Network Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={toggleNetworkMenu}
              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-md"
              style={{ borderLeft: `4px solid ${getNetworkColor(chainId)}` }}
            >
              <Network
                size={18}
                className="mr-2"
                color={getNetworkColor(chainId)}
              />
              <span>{currentNetwork?.name || "Unknown Network"}</span>
              <ChevronDown
                size={16}
                className={`ml-2 transition-transform duration-300 ${
                  isNetworkMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isNetworkMenuOpen && (
              <div className="absolute z-10 right-0 mt-2 w-60 bg-gray-800 shadow-xl rounded-lg border border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
                <div className="p-2 border-b border-gray-700 text-sm text-gray-400">
                  Select Network
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {chains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        switchChain({ chainId: chain.id });
                        setIsNetworkMenuOpen(false);
                      }}
                      disabled={isSwitchingChain}
                      className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: getNetworkColor(chain.id) }}
                        ></div>
                        <span>{chain.name}</span>
                      </div>
                      {chainId === chain.id && (
                        <Check size={16} className="text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Address Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={toggleAddressMenu}
              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-md"
            >
              <Wallet size={18} className="mr-2" />
              <span className="font-mono">
                {address?.slice(0, 5)}...{address?.slice(-4)}
              </span>
              <ChevronDown
                size={16}
                className={`ml-2 transition-transform duration-300 ${
                  isAddressMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isAddressMenuOpen && (
              <div className="absolute z-10 right-0 mt-2 w-64 bg-gray-800 shadow-xl rounded-lg border border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
                <div className="p-3 border-b border-gray-700">
                  <div className="text-sm text-gray-400">Connected Wallet</div>
                  <div className="font-mono text-white mt-1 break-all">
                    {address}
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={copyAddress}
                    className="flex w-full items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="mr-2 text-green-500" />
                    ) : (
                      <Copy size={16} className="mr-2" />
                    )}
                    {copied ? "Address Copied!" : "Copy Address"}
                  </button>

                  {currentNetwork?.blockExplorers?.default && (
                    <button
                      onClick={openExplorer}
                      className="flex w-full items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      View on {currentNetwork.blockExplorers.default.name}
                    </button>
                  )}

                  <button
                    onClick={() => disconnect()}
                    className="flex w-full items-center px-3 py-2 mt-2 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-md transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Error Toast - Fixed Position */}
      {showError && (
        <div className="fixed top-4 right-4 z-50 flex items-center text-red-500 text-sm bg-red-100 px-4 py-3 rounded-md shadow-md animate-in fade-in slide-in-from-top-5 duration-300">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setShowError(false)}
            className="ml-3 p-1 hover:bg-red-200 rounded-full"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {connectors.map(
          (connector) =>
            connector.name === "MetaMask" && (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className={`relative flex items-center justify-center gap-5 px-4 py-2 
              ${
                connector.name === "MetaMask"
                  ? "bg-gray-700 hover:bg-orange-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } 
              text-white font-medium rounded-lg transition-all duration-300 
              hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed
              overflow-hidden group`}
              >
                {isPending ? (
                  <div className="flex items-center">
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <span className="flex items-center">
                      {connector.name === "MetaMask" ? (
                        <MetaMaskLogo className="w-6 h-6 mr-2" />
                      ) : (
                        <LinkIcon size={18} className="mr-2" />
                      )}
                      Connect {connector.name}
                    </span>
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                  </>
                )}
              </button>
            )
        )}
      </div>
    </>
  );
}
