"use client"
import { useState, useRef, useEffect } from 'react';
import { Cross, HeartIcon } from 'lucide-react';
import NFTCollections from '@/lib/constant';

const Iphone = () => {
  // Flatten all NFTs from collections into a single array
  const allNFTs = NFTCollections.reduce((acc: any[], collection) => 
    [...acc, ...collection.nfts], [] as any[]
  );

  // State to keep track of available and seen NFTs
  const [availableNFTs, setAvailableNFTs] = useState(() => [...allNFTs]);
  const [seenNFTs, setSeenNFTs] = useState<any[]>([]);
  const [currentNFT, setCurrentNFT] = useState(() => {
    const randomIndex = Math.floor(Math.random() * allNFTs.length);
    return allNFTs[randomIndex];
  });

  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const lastPositionRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Function to get next random NFT
  const getNextNFT = () => {
    if (availableNFTs.length === 0) {
      // If all NFTs have been seen, reset the pool
      setAvailableNFTs([...allNFTs]);
      setSeenNFTs([]);
      const randomIndex = Math.floor(Math.random() * allNFTs.length);
      return allNFTs[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * availableNFTs.length);
    const nextNFT = availableNFTs[randomIndex];
    
    // Remove the selected NFT from available pool and add to seen
    setAvailableNFTs(prev => prev.filter((_, index) => index !== randomIndex));
    setSeenNFTs(prev => [...prev, nextNFT]);
    
    return nextNFT;
  };

  const calculateVelocity = (currentPosition: number, currentTime: number) => {
    if (lastTimeRef.current && lastPositionRef.current) {
      const deltaTime = currentTime - lastTimeRef.current;
      const deltaPosition = currentPosition - lastPositionRef.current;
      velocityRef.current = deltaPosition / deltaTime;
    }
    lastTimeRef.current = currentTime;
    lastPositionRef.current = currentPosition;
  };

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setSwipeStart(clientX);
    startTimeRef.current = Date.now();
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();
    lastPositionRef.current = clientX;
    setSwipeDirection(null);
  };

  const handleSwipeMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!swipeStart) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offset = clientX - swipeStart;
    calculateVelocity(clientX, Date.now());
    
    const resistance = 0.5;
    const dampedOffset = offset * resistance;
    
    setSwipeOffset(dampedOffset);
    
    if (offset > 0) {
      setSwipeDirection('right');
    } else if (offset < 0) {
      setSwipeDirection('left');
    }
  };

  const animateReturn = () => {
    const animate = () => {
      setSwipeOffset((current) => {
        const remaining = Math.abs(current);
        if (remaining < 0.5) {
          cancelAnimationFrame(animationRef.current!);
          return 0;
        }
        
        const newOffset = current * 0.85;
        animationRef.current = requestAnimationFrame(animate);
        return newOffset;
      });
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleSwipeEnd = () => {
    const swipeTime = Date.now() - (startTimeRef.current || 0);
    const swipeThreshold = 100;
    const velocityThreshold = 0.5;
    const absVelocity = Math.abs(velocityRef.current);

    if (Math.abs(swipeOffset) > swipeThreshold || absVelocity > velocityThreshold) {
      if (swipeOffset > 0 || (absVelocity > velocityThreshold && velocityRef.current > 0)) {
        handleLike();
      } else {
        handleDislike();
      }
    } else {
      animateReturn();
    }

    setSwipeStart(null);
    setSwipeDirection(null);
  };

  const showNextNFT = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentNFT(getNextNFT());
      setSwipeOffset(0);
      setIsAnimating(false);
    }, 300);
  };

  const handleLike = () => {
    setSwipeOffset(300);
    console.log('Liked:', currentNFT.name);
    showNextNFT();
  };

  const handleDislike = () => {
    setSwipeOffset(-300);
    console.log('Disliked:', currentNFT.name);
    showNextNFT();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getSwipeStyles = () => {
    let rotation = (swipeOffset / 300) * 5;
    let scale = 1 - Math.abs(swipeOffset) / 1000;
    
    return {
      transform: `translateX(${swipeOffset}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: Math.max(0, 1 - Math.abs(swipeOffset) / 300)
    };
  };

  return (
    <div className="iPhoneFrame bg-sky-300 rounded-xl h-[600px] w-80 p-[3px] px-1 overflow-hidden select-none">
      <div className="h-full w-full bg-zinc-950 rounded-xl overflow-hidden relative select-none">
        <div className="absolute w-24 h-6 rounded-full bg-zinc-950 top-2 z-10 left-1/2 -translate-x-1/2 flex justify-end items-center p-2">
          <div className="w-2 h-2 rounded-full bg-zinc-800 flex justify-center items-center"></div>
        </div>
        <div 
          className="relative h-full w-full p-1 flex items-center justify-center select-none touch-none"
          onMouseDown={handleSwipeStart}
          onMouseMove={handleSwipeMove}
          onMouseUp={handleSwipeEnd}
          onMouseLeave={handleSwipeEnd}
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
          draggable="false"
        >
          <div 
            className={`absolute z-20 left-6 top-8 transform transition-opacity ${
              swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="text-green-500 border-4 border-green-500 rounded-lg px-4 py-2 rotate-[-20deg]">
              <span className="text-2xl font-bold">LIKE</span>
            </div>
          </div>
          <div 
            className={`absolute z-20 right-6 top-8 transform transition-opacity ${
              swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="text-red-500 border-4 border-red-500 rounded-lg px-4 py-2 rotate-[20deg]">
              <span className="text-2xl font-bold">NOPE</span>
            </div>
          </div>

          <div className='absolute bottom-0 left-0 min-h-[400px] w-full bg-gradient-to-b from-transparent to-black/70 bg-opacity-5 flex flex-col justify-end p-6 z-10 select-none'>
            <div className='text-white mb-8 px-4 select-none'>
              <h2 className='text-xl font-bold'>{currentNFT.name}</h2>
              <p className='text-sm opacity-80'>{currentNFT.collection}</p>
            </div>
            <div className='flex justify-center items-center gap-16'>
              <button 
                onClick={handleDislike}
                className='w-14 h-14 rounded-full border-[2px] border-red-300 bg-red-600 flex justify-center items-center transform hover:scale-110 transition-transform'
              >
                <Cross className='w-8 h-8 rotate-45 fill-current' />
              </button>
              <button 
                onClick={handleLike}
                className='w-14 h-14 rounded-full border-[2px] border-green-300 bg-green-500 flex justify-center items-center transform hover:scale-110 transition-transform'
              >
                <HeartIcon className='w-8 h-8 fill-current' />
              </button>
            </div>
          </div>
          <div 
            className="h-full w-full transition-all duration-300 ease-out select-none"
            style={getSwipeStyles()}
          >
            <img 
              src={currentNFT.image} 
              className="h-full w-full object-cover rounded-xl select-none"
              alt={currentNFT.name}
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Iphone;