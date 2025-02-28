import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full p-3 px-5 flex justify-between items-center">
      <div className="font-serif text-2xl">
        Swipe<span className="text-yellow-300">Bid</span>
      </div>
      <div className="flex gap-10 items-center justify-center px-4 text-base">
        <div className="hover:scale-110 transition-all duration-300">
          Start Swiping
        </div>
        <div className="hover:scale-110 transition-all duration-300">
          Create NFT
        </div>
        <div className="hover:scale-110 transition-all duration-300">
          Your Listings
        </div>

        {/* <ConnectButton
          accountStatus={"address"}
          chainStatus={"icon"}
          showBalance={false}
        /> */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            return (
              <div>
                {(() => {
                  if (!mounted || !account || !chain) {
                    return (
                      <button
                        onClick={openConnectModal}
                        style={{ backgroundColor: "" }}
                        className="bg-yellow-500 text-white text-base px-3 py-2 rounded-lg hover:scale-110 transition-all duration-300"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  // Connected state UI
                  return (
                    <div style={{ display: "flex", gap: "40px" }}>
                      <button
                        onClick={openChainModal}
                        style={{ backgroundColor: "#your-custom-color" }}
                        className="bg-white text-black px-3 py-2 rounded-lg hover:scale-110 transition-all duration-300"
                      >
                        {chain.name}
                      </button>

                      <button
                        onClick={openAccountModal}
                        style={{ backgroundColor: "#your-custom-color" }}
                        className="bg-white text-black px-3 py-2 rounded-lg hover:scale-110 transition-all duration-300"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  );
};

export default Navbar;
