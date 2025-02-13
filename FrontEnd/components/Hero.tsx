import Image from "next/image"
const NFTCollections = [{
    "id": 1,
    "title": "The First Collection",
    "description": "This is the first collection of NFTs",
    "image": "/HeroNFTs/Bored_Apes.jpg",
},
{"id": 2,
    "title": "The First Collection",
    "description": "This is the first collection of NFTs",
    "image": "/HeroNFTs/Crying.jpg", },
{
    "id": 3,
    "title": "The First Collection",
    "description": "This is the first collection of NFTs",
    "image": "/HeroNFTs/Monkey.jpg",
}]




const Hero = () => {
  return (
    <section className="flex flex-col gap-4 items-center justify-center h-screen">
        <div className="bg-yellow-300 p-3 rounded-3xl text-gray-900 font-light shadow-2xl shadow-foreground-2xl
         shadow-yellow-400">Bid as easy as a swipe is</div>
        <div className="text-4xl font-serif font-extralight text-center">Get The World's Best NFT Collection,<br />Creative Art</div>
        <div className="bg-white text-black font-serif p-2 px-4 rounded-3xl">Start Swiping</div>
        <div className="w-full flex justify-center gap-8">
            {NFTCollections.map((collection)=>(
                <img className="rounded-2xl object-cover w-64" key={collection.id} src={collection.image}  alt="Nft collection" />
            ))}
        </div>
    </section>
  )
}

export default Hero