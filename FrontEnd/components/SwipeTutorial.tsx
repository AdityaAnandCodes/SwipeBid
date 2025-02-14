"use client"
import { ChevronRight, ChevronLeft, Sparkles, Heart, X, Info, HeadsetIcon, HeartCrack, HeartIcon, Cross } from 'lucide-react';
import Iphone from './Iphone';

const SwipeTutorial = () => {
  return (
    <section className="w-full p-4 h-screen grid grid-cols-2 place-items-center">
        <div className="max-w-xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">New Feature</span>
          </div>
          <h2 className="text-4xl font-bold text-white">
            Discover & Bid on NFTs
            <span className="block text-emerald-400">with a Simple Swipe</span>
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Finding your next digital masterpiece has never been easier. Our innovative swipe-based NFT marketplace brings the familiar dating app experience to NFT collecting.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-800/50 backdrop-blur border border-zinc-700">
            <div className="p-3 bg-emerald-400/10 rounded-full">
              <Heart className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                Swipe Right to Bid
                <ChevronRight className="w-5 h-5 text-emerald-400" />
              </h3>
              <p className="text-zinc-400">
                Found an NFT you love? Swipe right to place your bid and potentially add it to your collection. Get notified instantly when your bid is accepted.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-800/50 backdrop-blur border border-zinc-700">
            <div className="p-3 bg-rose-400/10 rounded-full">
              <X className="w-6 h-6 text-rose-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                Swipe Left to Skip
                <ChevronLeft className="w-5 h-5 text-rose-400" />
              </h3>
              <p className="text-zinc-400">
                Not interested? Simply swipe left to see the next unique NFT in your discovery feed. Your preferences help us curate better recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Info className="w-4 h-4" />
          <p>Your preferences are saved automatically to improve recommendations</p>
        </div>
      </div>
        <div className='flex flex-col items-center justify-center'>
          <Iphone />
           
        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-5">  
          <p>The Above Model is for Demo Purpose.</p>
        </div>
        </div>
    </section>
  )
}

export default SwipeTutorial