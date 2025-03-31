"use client";

// import { ConnectButton } from "@rainbow-me/rainbowkit";
import ConnectButton from "./ConnectButton";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 w-full p-3 px-5 bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="font-serif text-2xl">
            Swipe<span className="text-yellow-300">Bid</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 lg:gap-10 items-center">
            <Link
              href="/explore"
              className="hover:text-yellow-300 transition-all duration-300"
            >
              Start Swiping
            </Link>
            <Link
              href="/create"
              className="hover:text-yellow-300 transition-all duration-300"
            >
              Create NFT
            </Link>
            <Link
              href="/listings"
              className="hover:text-yellow-300 transition-all duration-300"
            >
              Your Listings
            </Link>
            <Link
              href="/owned"
              className="hover:text-yellow-300 transition-all duration-300"
            >
              Your NFTs
            </Link>

            {/* Connect Button Desktop */}
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col gap-4">
              <Link
                href="/explore"
                className="py-2 hover:text-yellow-300 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Swiping
              </Link>
              <Link
                href="/create"
                className="py-2 hover:text-yellow-300 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create NFT
              </Link>
              <Link
                href="/listings"
                className="py-2 hover:text-yellow-300 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Your Listings
              </Link>

              {/* Connect Button Mobile */}
              <div className="pt-2">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Connect Wallet Button Component
// const ConnectWalletButton = () => {
//   return (
//     <ConnectButton.Custom>
//       {({
//         account,
//         chain,
//         openAccountModal,
//         openChainModal,
//         openConnectModal,
//         mounted,
//       }) => {
//         return (
//           <div>
//             {(() => {
//               if (!mounted || !account || !chain) {
//                 return (
//                   <button
//                     onClick={openConnectModal}
//                     className="bg-yellow-500 text-white text-base px-3 py-2 rounded-lg hover:scale-105 transition-all duration-300"
//                   >
//                     Connect Wallet
//                   </button>
//                 );
//               }

//               // Connected state UI
//               return (
//                 <div className="flex gap-4">
//                   <button
//                     onClick={openChainModal}
//                     className="bg-white text-black px-3 py-2 rounded-lg hover:scale-105 transition-all duration-300"
//                   >
//                     {chain.name}
//                   </button>

//                   <button
//                     onClick={openAccountModal}
//                     className="bg-white text-black px-3 py-2 rounded-lg hover:scale-105 transition-all duration-300"
//                   >
//                     {account.displayName}
//                   </button>
//                 </div>
//               );
//             })()}
//           </div>
//         );
//       }}
//     </ConnectButton.Custom>
//   );
// };

export default Navbar;
