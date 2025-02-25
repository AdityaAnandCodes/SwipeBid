import { ArrowRight, Palette, Sparkles } from "lucide-react"
import Link from "next/link"

const NFTCollections = [{
    "id": 1,
    "title": "The First Collection",
    "description": "This is the first collection of NFTs",
    "image": "/HeroNFTs/3D_Militia.jpg",
},
{"id": 2,
    "title": "The First Collection",
    "description": "This is the first collection of NFTs",
    "image": "/HeroNFTs/CyberCity.jpg", },
{
    "id": 3,
    "title": "The First Collection",
    "description": "This is the first collection of NFTs",
    "image": "/HeroNFTs/Monkey.jpg",
}]




const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-900 to-transparent py-16 px-4">
       <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 mt-5">
        {/* Badge */}
        <div className="bg-yellow-300/90 backdrop-blur-sm p-3 rounded-full text-gray-900 font-medium shadow-lg 
        shadow-yellow-400/20 flex items-center gap-2 transition-transform duration-300">
          <Sparkles className="w-4 h-4" />
          Create • Collect • Trade
        </div>

        {/* Heading */}
        <div className="text-center transition-opacity duration-300">
          <h1 className="text-5xl md:text-6xl font-serif font-light text-white mb-4">
            Your Creative Journey
            <span className="text-yellow-300"> Starts Here</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Buy unique NFTs from top artists or showcase your own digital masterpieces 
            in our vibrant marketplace
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap justify-center mb-5">
          <Link href="/explore" className="group bg-yellow-300 text-gray-900 font-medium py-3 px-8 rounded-full 
          hover:bg-yellow-400 transition-all duration-300 flex items-center gap-2 shadow-lg 
          hover:shadow-yellow-400/20">
            Start Exploring
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/create" className="group bg-gray-800 text-yellow-300 font-medium py-3 px-8 rounded-full 
          hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 shadow-lg 
          hover:shadow-yellow-400/10">
            Create NFT
            <Palette className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>
        
        <div className="w-full flex justify-center gap-8">
            {NFTCollections.map((collection)=>(
                <img className="rounded-2xl object-cover h-80 w-72" key={collection.id} src={collection.image}  alt="Nft collection" />
            ))}
        </div>
        </div>
    </section>
  )
}

export default Hero