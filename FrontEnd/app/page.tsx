import CreateNFTTutorial from "@/components/CreatedNFT";
import CTASection from "@/components/CTA";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import SwipeTutorial from "@/components/SwipeTutorial";


export default function Home() {
  return (
    <main className="w-full min-h-screen relative flex flex-col gap-8">
      <Navbar />
      <Hero/>
      <SwipeTutorial />
      <CreateNFTTutorial />
      <CTASection />
      <Footer/>
    </main>

  );
}
