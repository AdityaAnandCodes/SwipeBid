import { ChevronRight, ChevronLeft, Sparkles, Heart, X, Info, HeadsetIcon, HeartCrack, HeartIcon, Cross } from 'lucide-react';

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
            <div className="iPhoneFrame bg-sky-300 rounded-xl h-[600px] w-80 p-[3px] px-1 overflow-hidden">
                <div className="h-full w-full bg-zinc-950 rounded-xl overflow-hidden relative ">
                    <div className="absolute w-24 h-6 rounded-full bg-zinc-950 top-2 z-10 left-1/2 -translate-x-1/2 flex justify-end items-center p-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-800 flex justify-center items-center"></div>
                    </div>
                    <div className="relative h-full w-full p-1 flex items-center justify-center">
                        <div className='absolute bottom-0 left-0 min-h-[390px] w-full bg-gradient-to-b from-transparent to-black/70 bg-opacity-5 flex justify-center items-end p-8'>
                          <div className='flex justify-center items-center gap-16 z-10'>
                          <div className='w-14 h-14 rounded-full border-[2px] border-red-300 bg-red-600  flex justify-center items-center'>
                            <Cross className='w-8 h-8 rotate-45 fill-current' />
                          </div>
                          <div className='w-14 h-14 rounded-full border-[2px] border-green-300 bg-green-500  flex justify-center items-center'>
                            <HeartIcon className='w-8 h-8 fill-current' />
                          </div>
                          </div>
                        </div>
                        <img src="/HeroNFTs/Monkey.jpg" className="h-full w-full object-cover rounded-xl" />
                    </div>
                </div>
                
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-5">
          
          <p>The Above Model is for Demo Purpose.</p>
        </div>
        </div>
    </section>
  )
}

export default SwipeTutorial