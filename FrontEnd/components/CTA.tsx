import React from 'react';
import { 
  Wallet, 
  Trophy, 
  Sparkles, 
  ArrowRight,
  Star,
  CircleDollarSign,
  SwissFrancIcon
} from 'lucide-react';

const CTASection = () => {
  return (
    <div className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">New Way to Collect NFTs</span>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-6">
            Discover and Collect
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent"> Rare NFTs</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Experience the future of NFT collecting with our innovative swipe-based marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="group border border-white/10 rounded-2xl p-8 hover:border-emerald-400/50 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 group-hover:bg-emerald-400/10 transition-colors">
                <SwissFrancIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <Star className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
              Swipe & Discover
            </h3>
            <p className="text-zinc-400">
              Find your next digital masterpiece with a simple swipe. Our curated collection ensures quality and authenticity.
            </p>
          </div>

          <div className="group border border-white/10 rounded-2xl p-8 hover:border-emerald-400/50 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 group-hover:bg-emerald-400/10 transition-colors">
                <CircleDollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <Star className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
              Instant Bidding
            </h3>
            <p className="text-zinc-400">
              Place bids instantly with a swipe right. Get notified immediately when your bid is accepted.
            </p>
          </div>

          <div className="group border border-white/10 rounded-2xl p-8 hover:border-emerald-400/50 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 group-hover:bg-emerald-400/10 transition-colors">
                <Trophy className="w-8 h-8 text-emerald-400" />
              </div>
              <Star className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
              Win Unique Pieces
            </h3>
            <p className="text-zinc-400">
              Each NFT is verified on the blockchain. Build a collection that stands out in the digital art world.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button className="group relative inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-zinc-900 px-8 py-4 rounded-full font-semibold text-lg transition-all overflow-hidden">
            <span>Start Collecting Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;