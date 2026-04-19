import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TreePine, Calendar, ExternalLink, Leaf, Globe, Plus, ShieldCheck, Award, TrendingUp, ChevronRight, Clock } from "lucide-react";
import { MARKETPLACE_NFTS } from "./Marketplace";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/config";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [trees, setTrees] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [treesRes, txsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/nfts/my-trees`, { headers }),
          fetch(`${API_BASE_URL}/api/nfts/my-transactions`, { headers })
        ]);

        if (treesRes.ok) setTrees(await treesRes.json());
        if (txsRes.ok) setTransactions(await txsRes.json());

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const treesPlanted = trees.length;
  // Use real ecoScore from user profile if available, otherwise calculate from trees
  const ecoScore = user?.ecoScore || (treesPlanted * 150);
  // Calculate tokens from transactions
  const ecoTokens = transactions.reduce((acc, tx) => acc + (tx.status === 'Completed' ? tx.amount : 0), 0);
  const activitiesCompleted = transactions.length;

  return (
    <div className="min-h-screen pt-8 pb-20 relative z-10">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-heading font-extrabold mb-2 text-foreground">
              Welcome back, <span className="gradient-text">{user?.displayName || "EcoWarrior"}</span>
            </h1>
            <p className="text-muted-foreground text-lg">Your actions are creating real-world impact.</p>
          </div>
          <Link to="/submit-action">
            <Button className="btn-eco px-8 h-12 text-lg">
              <Plus className="w-5 h-5 mr-2" /> Log Eco-Action
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 glass-card-hover group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Eco-Score</p>
              <h3 className="text-4xl font-extrabold text-foreground">{ecoScore}</h3>
              <Progress value={min(100, (ecoScore / 500) * 100)} className="mt-4 h-2 bg-primary/20" />
            </div>
          </div>

          <div className="glass-card p-6 glass-card-hover group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                <Award className="w-6 h-6 text-success" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Eco-Tokens Earned</p>
              <h3 className="text-4xl font-extrabold text-success animate-glow">{ecoTokens}</h3>
              <p className="text-xs text-success/80 mt-2 font-medium">Verified Rewards</p>
            </div>
          </div>

          <div className="glass-card p-6 glass-card-hover group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <Globe className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Eco-Assets Owned</p>
              <h3 className="text-4xl font-extrabold text-foreground">{treesPlanted}</h3>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Verified on Polygon</p>
            </div>
          </div>

          <div className="glass-card p-6 glass-card-hover group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Carbon Offset</p>
              <h3 className="text-4xl font-extrabold text-foreground">{(treesPlanted * 22.5).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg/yr</span></h3>
              <p className="text-[10px] text-primary/80 mt-2 font-mono uppercase tracking-widest">Atmospheric Recovery Active</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Assets */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold font-heading">Impact Collection</h3>
                <Link to="/digital-forest">
                  <Button variant="ghost" className="text-primary hover:bg-primary/10">
                    Enter Forest <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {trees.length > 0 ? trees.slice(0, 4).map((tree) => {
                  const nftDef = MARKETPLACE_NFTS.find(n => n.name === tree.treeType);
                  const imgSrc = nftDef ? nftDef.img : "/images/nfts/tree1.png";
                  const imgHue = nftDef ? nftDef.hue : 0;

                  return (
                    <div key={tree.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 aspect-video flex flex-col justify-end p-6 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                      <img
                        src={imgSrc}
                        style={{ filter: `hue-rotate(${imgHue}deg)` }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-0 opacity-70"
                        alt={tree.treeType}
                        loading="lazy"
                      />

                      <div className="relative z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-3 py-1 bg-primary/80 backdrop-blur-md rounded-full text-xs font-bold text-white">NFT</span>
                          <span className="text-white/60 text-[10px] font-mono">
                            {tree.tokenId}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-1">{tree.treeType}</h4>
                        <p className="text-xs text-white/70">Minted {new Date(tree.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/5 rounded-xl border border-white/10">
                    <TreePine className="w-12 h-12 mb-4 opacity-20" />
                    <p>No NFTs minted yet. Start by logging an eco-action!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity / Rewards */}
          <div className="space-y-8">
            <div className="glass-card p-8 h-full">
              <h3 className="text-2xl font-bold font-heading mb-8 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" /> Activity Log
              </h3>

              <div className="space-y-6">
                {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className={`p-2 rounded-lg ${tx.status === 'Completed' ? 'bg-success/10' : 'bg-yellow-500/10'}`}>
                      <Award className={`w-5 h-5 ${tx.status === 'Completed' ? 'text-success' : 'text-yellow-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm truncate">Eco-Token Reward</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'Completed' ? 'bg-success/20 text-success' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{new Date(tx.createdAt).toLocaleDateString()} • {tx.amount} Tokens</p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 truncate">TX: {tx.txHash}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No activities logged yet.
                  </div>
                )}
              </div>

              {transactions.length > 5 && (
                <Button variant="ghost" className="w-full mt-6 text-sm text-primary">View Full History</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick helper
const min = (a: number, b: number) => a < b ? a : b;

export default Dashboard;
