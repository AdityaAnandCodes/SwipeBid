import { ArrowRight, Palette, Sparkles } from "lucide-react";
import Link from "next/link";

const NFTCollections = [
  {
    id: 1,
    title: "The First Collection",
    description: "This is the first collection of NFTs",
    image: "/HeroNFTs/3D_Militia.jpg",
  },
  {
    id: 2,
    title: "The First Collection",
    description: "This is the first collection of NFTs",
    image: "/HeroNFTs/CyberCity.jpg",
  },
  {
    id: 3,
    title: "The First Collection",
    description: "This is the first collection of NFTs",
    image: "/HeroNFTs/Monkey.jpg",
  },
];

const Hero = () => {
  return (
    <section className="min-h-screen max-sm:min-h-fit bg-gradient-to-b from-gray-900 to-transparent py-12 md:py-16 px-4 max-sm:py-0 max-sm:pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 md:gap-8 mt-4 md:mt-5">
        {/* Badge */}
        <div
          className="bg-yellow-300/90 backdrop-blur-sm p-2 md:p-3 rounded-full text-gray-900 text-sm md:text-base font-medium shadow-lg 
        shadow-yellow-400/20 flex items-center gap-2 transition-transform duration-300"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          Create • Collect • Trade
        </div>

        {/* Heading */}
        <div className="text-center transition-opacity duration-300">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-3 md:mb-4 px-2">
            Your Creative Journey
            <span className="text-yellow-300"> Starts Here</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-2">
            Buy unique NFTs from top artists or showcase your own digital
            masterpieces in our vibrant marketplace
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 md:gap-4 flex-wrap justify-center mb-4 md:mb-5">
          <Link
            href="/explore"
            className="group bg-yellow-300 text-gray-900 font-medium py-2 md:py-3 px-6 md:px-8 rounded-full 
          hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2 shadow-lg 
          hover:shadow-yellow-400/20 text-sm md:text-base"
          >
            Start Exploring
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/create"
            className="group bg-gray-800 text-yellow-300 font-medium py-2 md:py-3 px-6 md:px-8 rounded-full 
          hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 shadow-lg 
          hover:shadow-yellow-400/10 text-sm md:text-base"
          >
            Create NFT
            <Palette className="w-3 h-3 md:w-4 md:h-4 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>

        {/* NFT Collection Images */}
        <div className="w-full">
          {/* Desktop View (3 images in a row) */}
          <div className="hidden md:flex justify-center gap-8">
            {NFTCollections.map((collection) => (
              <img
                className="rounded-2xl object-cover h-80 w-72"
                key={collection.id}
                src={collection.image}
                alt={`NFT collection ${collection.id}`}
              />
            ))}
          </div>

          {/* Mobile View (single image carousel style) */}
          <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory pb-4 max-sm:pb-0 gap-4 w-full px-2">
            {NFTCollections.map((collection) => (
              <div
                key={collection.id}
                className="snap-center shrink-0 first:pl-4 last:pr-4"
              >
                <img
                  className="rounded-2xl object-cover h-24 w-24 md:h-72 md:w-72"
                  src={collection.image}
                  alt={`NFT collection ${collection.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
