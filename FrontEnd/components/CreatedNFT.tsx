import React from "react";
import { Sparkles, Upload, Tag, Wallet, Plus, Info } from "lucide-react";
import Link from "next/link";

const CreateNFTTutorial = () => {
  return (
    <section className="w-full p-4 md:p-8 min-h-screen flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 place-items-center">
      <div className="max-w-xl space-y-8 py-6 lg:py-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-yellow-300/80" />
            <span className="text-sm">Create & Sell NFTs</span>
          </div>
          <h2 className="text-4xl text-white">
            Create Once,
            <span className="block opacity-80">Sell Forever</span>
          </h2>
          <p className="text-gray-400">
            Transform your digital creations into tradeable NFTs. Set up
            auctions or fixed prices and let the market discover your art.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="p-3 bg-white/5 rounded-lg">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-2">Upload Your Creation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Support for all major file formats. Add metadata to make your
                NFT discoverable in our marketplace.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="p-3 bg-white/5 rounded-lg">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white mb-2">Set Price & Terms</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Choose your sale type: fixed price or timed auction. Set
                royalties to earn from future resales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
          <Wallet className="w-4 h-4" />
          <p>Payments are automatically sent to your connected wallet</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/5 p-4 rounded-lg">
          <Info className="w-4 h-4" />
          <p>This Model is Just For Demonstration Purpose</p>
        </div>
      </div>

      <div className="flex items-center w-full">
        <div className="w-full max-w-lg bg-white/5 rounded-xl p-4 md:p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div
              className="border border-dashed border-white/30 rounded-xl p-4 md:p-8 text-center
            hover:border-white/30 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center
              mx-auto mb-4"
              >
                <Plus className="w-6 h-6 text-white/80" />
              </div>
              <p className="text-gray-400 text-sm">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Maximum file size: 50MB
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Give your NFT a name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                  text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Description
                </label>
                <textarea
                  disabled
                  placeholder="Tell the story behind your creation"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                  text-white placeholder-gray-500 focus:outline-none focus:border-white/20
                  resize-none h-24"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Traits
                </label>
                <input
                  disabled
                  type="text"
                  placeholder="Enter Traits For The NFT"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                  text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Price
                  </label>
                  <div className="relative">
                    <input
                      disabled
                      type="text"
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                      text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      ETH
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Royalty
                  </label>
                  <div className="relative">
                    <input
                      disabled
                      type="text"
                      placeholder="2.5"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
                      text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-emerald-500 hover:bg-emerald-500/90 text-white p-3 
              rounded-lg transition-colors"
              >
                <Link href="/create" className="w-full block">
                  Create NFT
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateNFTTutorial;
