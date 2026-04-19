import { Leaf, Shield, Globe, Wallet, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Features = () => {
  return (
    <div className="min-h-screen py-20 relative z-10 w-full max-w-7xl mx-auto px-6">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium text-sm mb-6 shadow-[var(--shadow-glow)]">
          <Globe className="w-4 h-4" />
          <span>How It Works</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-extrabold mb-6 gradient-text tracking-tight">
          Virtual Action. Real Impact.
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          GreenVerse bridges the gap between Web3 communities and global reforestation. 
          Mint curated digital trees to instantly fund verified environmental organizations worldwide.
        </p>
      </div>

      {/* Steps Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {[
          {
            icon: <Wallet className="w-8 h-8 text-primary" />,
            title: "1. Connect Web3 Wallet",
            desc: "Securely link your MetaMask wallet to the GreenVerse platform to begin tracking your environmental impact seamlessly on-chain."
          },
          {
            icon: <Leaf className="w-8 h-8 text-success" />,
            title: "2. Mint Digital Trees",
            desc: "Browse our curated Marketplace of beautifully designed 3D regional trees and purchase them directly using MATIC/ETH."
          },
          {
            icon: <Shield className="w-8 h-8 text-info" />,
            title: "3. Direct Funding",
            desc: "100% of your mint fee is routed directly to our foundation wallet to fund physical reforestation projects globally, with zero intermediary cuts."
          }
        ].map((step, idx) => (
          <div key={idx} className="glass-card p-8 flex flex-col items-center text-center group hover:bg-white/5 transition-all animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
            <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold font-heading mb-3">{step.title}</h3>
            <p className="text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Feature Highlight */}
      <div className="glass-card overflow-hidden border border-primary/20 bg-black/40 p-8 md:p-12 flex flex-col items-center text-center">
        <h2 className="text-3xl font-heading font-bold mb-4">Why GreenVerse?</h2>
        <p className="max-w-xl text-muted-foreground mb-10">
          Traditional donation platforms lack transparency and tangible rewards. By utilizing blockchain technology, we provide an immutable record of your contributions while rewarding you with stunning digital art.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl text-left">
          {[
            "Immutable proof of donation via NFTs",
            "Zero intermediary fees—direct to foundation",
            "Gamified Eco-Score and Leaderboards",
            "Beautiful AI-generated 3D tree assets",
            "Polygon network for low gas fees",
            "Private, secure, and decentralized UX"
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground/90 font-medium">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link to="/marketplace">
            <Button className="btn-eco h-14 px-8 text-lg">
              Start Minting Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
