import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TreePine, Calendar, ExternalLink, Leaf, Globe, Plus, ShieldCheck } from "lucide-react";
import { MARKETPLACE_NFTS } from "./Marketplace";
import { API_BASE_URL } from "@/config";

interface NFTTreeData {
  id: number;
  tokenId: string;
  txHash: string;
  treeType: string;
  region: string;
  createdAt: string;
}

const NFTTrees = () => {
  const navigate = useNavigate();
  const [trees, setTrees] = useState<NFTTreeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTrees = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/nfts/my-trees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTrees(data);
        }
      } catch (error) {
        console.error("Failed to fetch trees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrees();
  }, [navigate]);

  return (
    <div className="min-h-screen py-10 relative z-10 w-full max-w-7xl mx-auto px-6">

      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium text-sm mb-4 shadow-[var(--shadow-glow)]">
            <Globe className="w-4 h-4" />
            <span>Impact Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 gradient-text">
            My Eco-Assets
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Your personal collection of digital environmental assets, minted on the blockchain to represent your real-world contributions.
          </p>
        </div>
        <Link to="/marketplace">
          <Button className="btn-eco h-12 px-6 shrink-0">
            <Plus className="w-5 h-5 mr-2" />
            Mint New Asset
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : trees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trees.map((tree, index) => {
            const nftDef = MARKETPLACE_NFTS.find(n => n.name === tree.treeType);
            const imgSrc = nftDef ? nftDef.img : "/images/nfts/tree1.png";
            const imgHue = nftDef ? nftDef.hue : 0;

            return (
              <div
                key={tree.id}
                className="glass-card glass-card-hover group flex flex-col overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden hidden sm:block h-64 w-full bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  <img
                    src={imgSrc}
                    style={{ filter: `hue-rotate(${imgHue}deg)` }}
                    alt={tree.treeType}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-0"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                      NFT ID: {tree.tokenId}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-2 text-foreground font-heading leading-tight">{tree.treeType}</h3>

                  {/* Certificate Detail HUD */}
                  <div className="space-y-3 mb-6 flex-1 px-1">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Verification Status</span>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">CERTIFIED: AUTHENTIC</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">CO2 Sequestration</span>
                      <span className="text-[10px] text-white font-bold font-mono">22.5 kg/YR</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Environmental Signature</span>
                      <span className="text-[10px] text-white/40 font-mono truncate max-w-[120px]">0xGVS_{tree.tokenId}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <a href={`https://polygonscan.com/tx/${tree.txHash}`} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="ghost" className="w-full h-10 text-[10px] font-mono tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400 border border-white/5 uppercase transition-all">
                        <ShieldCheck className="w-3 h-3 mr-2" />
                        View On-Chain Deed
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-16 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <TreePine className="w-12 h-12 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-heading font-bold mb-3">No Trees Found</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            Your virtual forest is currently empty. Start performing green actions to earn the ability to mint your first NFT tree.
          </p>
          <Link to="/marketplace">
            <Button className="btn-eco h-12 px-8">
              <Leaf className="w-5 h-5 mr-2" />
              Go to Marketplace
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default NFTTrees;
