"use client";

import NFTCollections from "@/lib/constant";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


const explore = () => {
  const [index, setIndex] = useState(0);


  const handleLike = () => {
    setIndex((prev : number) => {
      if (prev !== NFTCollections.length - 1) {
        return prev + 1;
      } else {
        return 0;
      }
    });
  }

  const handleDislike = () => {
    setIndex((prev: number) => {
      if (prev !== NFTCollections.length - 1) {
        return prev + 1;
      } else {
        return 0;
      }
    });
  };



  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-transparent p-5 flex flex-col gap-10 justify-start items-center">

      <Link href="/" className="absolute top-5 left-5 p-2 bg-white text-black rounded-full"> <ArrowBigLeft className="fill-current" /></Link>
      <div className="rounded-3xl w-[500px] h-[500px]">
        <img
          src={NFTCollections[index].image}
          alt="NFT"
          className="w-full h-full rounded-3xl p-0 border-white border-2 object-cover  "
        />
      </div>
      <div className="flex gap-10">
        <button onClick={handleLike} className="bg-white text-black px-3 p-2 rounded-xl ">
          Like
        </button>
        <button onClick={handleDislike} className="bg-white text-black px-3 p-2 rounded-xl ">
          Reject
        </button>
      </div>
    </main>
  );
}

export default explore