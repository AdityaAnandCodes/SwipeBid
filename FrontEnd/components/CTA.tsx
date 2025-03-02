import React from 'react';
import { 
  Wallet, 
  Trophy, 
  Sparkles, 
  ArrowRight,
  Star,
  CircleDollarSign,
  Palette
} from 'lucide-react';
import Link from 'next/link';

const CTASection = () => {
  return (
    <div className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 relative">
          <div
            className="inline-flex items-center gap-2 bg-yellow-300/90 backdrop-blur-sm rounded-full 
          px-4 py-2 mb-6 shadow-lg shadow-yellow-400/20"
          >
            <Sparkles className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-medium text-gray-900">
              New Way to Create & Trade NFTs
            </span>
          </div>

          <h2 className="text-5xl font-serif font-light text-white mb-6">
            Create, Discover and Collect
            <span className="text-yellow-300"> Digital Art</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join our community of artists and collectors in the most intuitive
            NFT marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div
            className="group border border-white/10 rounded-2xl p-8 hover:border-yellow-300/50 
          transition-all backdrop-blur-sm bg-gray-800/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 group-hover:bg-yellow-300/10 transition-colors">
                <Palette className="w-8 h-8 text-yellow-300" />
              </div>
              <Star className="w-5 h-5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3 group-hover:text-yellow-300 transition-colors">
              Create & Sell
            </h3>
            <p className="text-gray-400">
              Turn your digital creations into NFTs and showcase them to
              collectors worldwide.
            </p>
          </div>

          <div
            className="group border border-white/10 rounded-2xl p-8 hover:border-yellow-300/50 
          transition-all backdrop-blur-sm bg-gray-800/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 group-hover:bg-yellow-300/10 transition-colors">
                <CircleDollarSign className="w-8 h-8 text-yellow-300" />
              </div>
              <Star className="w-5 h-5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3 group-hover:text-yellow-300 transition-colors">
              Instant Trading
            </h3>
            <p className="text-gray-400">
              Buy, sell, and bid on NFTs with a simple swipe. Get instant
              notifications for all activities.
            </p>
          </div>

          <div
            className="group border border-white/10 rounded-2xl p-8 hover:border-yellow-300/50 
          transition-all backdrop-blur-sm bg-gray-800/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 group-hover:bg-yellow-300/10 transition-colors">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <Star className="w-5 h-5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3 group-hover:text-yellow-300 transition-colors">
              Build Your Collection
            </h3>
            <p className="text-gray-400">
              Collect unique, verified NFTs from top artists and establish your
              digital art portfolio.
            </p>
          </div>
        </div>

        <div className="text-center flex gap-4 justify-center">
          <button
            className="group bg-yellow-300 text-gray-900 font-medium py-3 px-8 rounded-full 
          hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2 shadow-lg 
          hover:shadow-yellow-400/20"
          ><Link href="/create">
            <span>Start Creating</span>
            </Link>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            className="group bg-gray-800 text-yellow-300 font-medium py-3 px-8 rounded-full 
          hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 shadow-lg 
          hover:shadow-yellow-400/10"
          >
            <Link href="/explore">
              <span>Start Collecting</span>
            </Link>
            <Wallet className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;