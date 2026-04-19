import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Leaf, Wallet, Loader2, Info, Recycle, Zap, Droplets, Trophy, Bird, Sun, Waves, Filter, AlertCircle, CheckCircle2 } from "lucide-react";
import { ethers } from "ethers";
import { NFT_TREE_ABI } from "@/contractAbis";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config";

// This should match the address deployed to your chosen network (e.g., Polygon)
const NFT_TREE_CONTRACT_ADDRESS = import.meta.env.VITE_NFT_TREE_ADDRESS || "0x0000000000000000000000000000000000000000";

export const MARKETPLACE_NFTS = [
  // --- CATEGORY: PLANTATION ---
  { id: 1, name: "Amazon Rainforest Oak", price: "0.01", region: "South America", img: "/images/nfts/tree1.png", category: "plantation", hue: 0 },
  { id: 2, name: "African Acacia", price: "0.015", region: "Africa", img: "/images/nfts/tree3.png", category: "plantation", hue: 45 },
  { id: 3, name: "Japanese Cherry Blossom", price: "0.03", region: "Asia", img: "/images/nfts/tree2.png", category: "plantation", hue: 280 },
  { id: 4, name: "Canadian Maple", price: "0.01", region: "North America", img: "/images/nfts/tree2.png", category: "plantation", hue: -45 },

  // --- CATEGORY: RECYCLING ---
  { id: 5, name: "Carbon Crusher Robot", price: "0.02", region: "Global", img: "/images/nfts/robot.png", category: "recycling", hue: 0 },
  { id: 6, name: "Circular Economy Gem", price: "0.025", region: "Europe", img: "/images/nfts/robot.png", category: "recycling", hue: 120 },

  // --- CATEGORY: ENERGY SAVING ---
  { id: 7, name: "Solar Pinnacle Orb", price: "0.035", region: "Australia", img: "/images/nfts/orb.png", category: "energy_saving", hue: 0 },
  { id: 8, name: "Wind Spirit Turbine", price: "0.04", region: "Europe", img: "/images/nfts/orb.png", category: "energy_saving", hue: 200 },

  // --- CATEGORY: CLEANUP ---
  { id: 9, name: "Ocean Purity Pearl", price: "0.05", region: "Pacific Ocean", img: "/images/nfts/anchor.png", category: "cleanup", hue: 180 },
  { id: 10, name: "Coastal Guardian Anchor", price: "0.045", region: "Atlantic", img: "/images/nfts/anchor.png", category: "cleanup", hue: 0 },

  // --- CATEGORY: WILDLIFE ---
  { id: 11, name: "Summit Eagle", price: "0.06", region: "Alps", img: "/images/nfts/eagle.png", category: "wildlife", hue: 0 },
  { id: 12, name: "Panda Guardian", price: "0.055", region: "Asia", img: "/images/nfts/eagle.png", category: "wildlife", hue: 240 },

  // --- CATEGORY: RENEWABLE ---
  { id: 13, name: "Solar Phoenix", price: "0.07", region: "Sahara", img: "/images/nfts/phoenix.png", category: "renewable", hue: 0 },
  { id: 14, name: "Wind Spirit Blade", price: "0.065", region: "North Sea", img: "/images/nfts/phoenix.png", category: "renewable", hue: 180 },

  // --- CATEGORY: MARINE ---
  { id: 15, name: "Abyssal Pearl", price: "0.08", region: "Deep Sea", img: "/images/nfts/pearl.png", category: "marine", hue: 0 },
  { id: 16, name: "Coral Sanctuary", price: "0.075", region: "Great Barrier", img: "/images/nfts/pearl.png", category: "marine", hue: 120 },
];

const Marketplace = () => {
  const { toast } = useToast();
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Sectors", icon: <Filter className="w-4 h-4" /> },
    { id: "plantation", name: "Plantation", icon: <Leaf className="w-4 h-4" /> },
    { id: "recycling", name: "Recycling", icon: <Recycle className="w-4 h-4" /> },
    { id: "energy_saving", name: "Energy", icon: <Zap className="w-4 h-4" /> },
    { id: "cleanup", name: "Cleanup", icon: <Droplets className="w-4 h-4" /> },
    { id: "wildlife", name: "Wildlife", icon: <Bird className="w-4 h-4" /> },
    { id: "renewable", name: "Renewables", icon: <Sun className="w-4 h-4" /> },
    { id: "marine", name: "Marine", icon: <Waves className="w-4 h-4" /> },
  ];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'recycling': return <Recycle className="w-3 h-3 text-primary" />;
      case 'energy_saving': return <Zap className="w-3 h-3 text-yellow-500" />;
      case 'cleanup': return <Droplets className="w-3 h-3 text-blue-400" />;
      case 'wildlife': return <Bird className="w-3 h-3 text-orange-400" />;
      case 'renewable': return <Sun className="w-3 h-3 text-yellow-300" />;
      case 'marine': return <Waves className="w-3 h-3 text-cyan-400" />;
      default: return <Leaf className="w-3 h-3 text-green-400" />;
    }
  };

  const filteredNfts = activeCategory === "all"
    ? MARKETPLACE_NFTS
    : MARKETPLACE_NFTS.filter(nft => nft.category === activeCategory);

  const handlePurchase = async (nft: typeof MARKETPLACE_NFTS[0]) => {
    if (NFT_TREE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      toast({
        title: "Configuration Required",
        description: "The smart contract is not yet linked. Please deploy your NFT contract and update the VITE_NFT_TREE_ADDRESS in your .env file.",
        variant: "eco-destructive"
      });
      return;
    }

    if (!(window as any).ethereum) {
      toast({
        title: "Wallet Connection Needed",
        description: "Please install or unlock MetaMask to begin minting your Eco-Assets.",
        variant: "eco-destructive"
      });
      return;
    }

    setPurchasingId(nft.id);
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        localStorage.setItem("walletAddress", accounts[0]);
        window.dispatchEvent(new Event("storage"));
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFT_TREE_CONTRACT_ADDRESS, NFT_TREE_ABI, signer);

      const metadataUri = `https://greenverse.io/metadata/nfts/${nft.id}`;
      const tx = await contract.buyTree(metadataUri, { value: ethers.parseEther(nft.price) });

      toast({
        title: "Transaction Broadcasted",
        description: "Your impact is being minted on-chain. Please wait for network confirmation...",
        variant: "eco"
      });

      const receipt = await tx.wait();

      if (receipt && receipt.status === 1) {
        const token = localStorage.getItem("token");
        const backendRes = await fetch(`${API_BASE_URL}/api/nfts/mint`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            treeType: nft.name,
            region: nft.region,
            txHash: receipt.hash,
            category: nft.category
          })
        });

        if (backendRes.ok) {
          toast({
            title: "Asset Minted!",
            description: `Success! ${nft.name} is now part of your permanent collection.`,
            variant: "eco"
          });
        }
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Minting Unsuccessful",
        description: error.reason || error.message || "An unexpected error occurred during the transaction.",
        variant: "eco-destructive"
      });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen py-10 relative z-10 w-full max-w-7xl mx-auto px-6">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium text-sm mb-4">
          <Trophy className="w-4 h-4" />
          <span>The Ultimate GreenVerse Meta-Shop</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 gradient-text">
          Mint Your Global Impact
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl border-l-4 border-primary pl-4">
          Diversify your sustainability portfolio. Fund biodiversity, clean energy, and ocean health with real on-chain assets.
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-12 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "ghost"}
            className={`rounded-xl transition-all duration-300 gap-2 h-11 px-6 ${activeCategory === cat.id ? "bg-primary text-white shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon}
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNfts.map((nft) => (
          <div key={nft.id} className="glass-card overflow-hidden group hover:shadow-[var(--shadow-glow)] transition-all duration-300 flex flex-col animate-scale-in">
            <div className="relative aspect-square overflow-hidden bg-muted">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
              <img src={nft.img} style={{ filter: `hue-rotate(${nft.hue}deg)` }} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-0" loading="lazy" />

              {/* Region Tag */}
              <div className="absolute top-3 right-3 z-20">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/20 uppercase tracking-widest">
                  {nft.region}
                </span>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-[10px] font-bold text-primary border border-primary/30 uppercase tracking-widest">
                  {getCategoryIcon(nft.category)}
                  {nft.category.replace('_', ' ')}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 z-20 text-white">
                <h3 className="text-lg font-bold font-heading shadow-sm">{nft.name}</h3>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between flex-1 gap-4">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                <span className="text-sm text-muted-foreground">Donation</span>
                <span className="font-bold text-primary flex items-center gap-1 text-lg">
                  {nft.price} MATIC
                </span>
              </div>

              <Button
                className="w-full btn-eco h-12 text-sm font-bold"
                onClick={() => handlePurchase(nft)}
                disabled={purchasingId === nft.id}
              >
                {purchasingId === nft.id ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><Wallet className="w-4 h-4 mr-2" /> Pay & Mint</>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10"></div>
        <div className="p-5 bg-primary/10 rounded-2xl shadow-inner">
          <Info className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h4 className="text-2xl font-bold mb-2">Sustainable Meta-Governance</h4>
          <p className="text-muted-foreground leading-relaxed">By minting these assets, you are verified as a core contributor to the GreenVerse ecosystem. Each sector represents a real project portfolio managed by our decentralized partners.</p>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
