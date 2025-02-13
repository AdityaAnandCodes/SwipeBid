import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import SwipeTutorial from "@/components/SwipeTutorial";


export default function Home() {
  return (
    <main className="w-full min-h-screen relative">
      <Navbar />
      <Hero/>
      <SwipeTutorial />
    </main>

  );
}
