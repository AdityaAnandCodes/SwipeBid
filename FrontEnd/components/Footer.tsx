import React from 'react';
import { Twitter, Instagram, Github, Mail, Heart, Sword, Shield, Wallet } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: <Twitter size={20} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
    { icon: <Github size={20} />, href: "#", label: "Github" },
    { icon: <Mail size={20} />, href: "#", label: "Email" }
  ];

  const features = [
    { icon: <Wallet size={24} />, title: "Secure Wallet", description: "Connect your crypto wallet securely" },
    { icon: <Sword size={24} />, title: "Bid & Collect", description: "Participate in NFT auctions easily" },
    { icon: <Shield size={24} />, title: "Protected Trading", description: "Safe and verified transactions" }
  ];

  return (
    <footer className="border-white border-t-2 border-dashed text-zinc-200 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              SwipeBid <Heart size={20} className="text-red-500" />
            </h3>
            <p className="text-zinc-400">
              Discover unique digital art through our innovative swipe-based NFT marketplace.
            </p>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Features</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
                  {feature.icon}
                  <span>{feature.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              {['Marketplace', 'How it Works', 'About Us', 'Support'].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Stay Updated</h4>
            <p className="text-zinc-400">Subscribe to our newsletter for the latest drops and features.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-zinc-800 px-4 py-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-sm">
            © 2025 SwipeNFT. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
