import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 w-full p-3 px-5 flex justify-between items-center">
      <div>SwipeBid</div>
      <div className="flex gap-8 items-center justify-center px-4">
        <div className="bg-white text-black rounded-3xl text-base px-3 p-1">
          <ConnectButton />
        </div>
        <div className="">Swipe</div>
      </div>
    </nav>
  );
};

export default Navbar;
