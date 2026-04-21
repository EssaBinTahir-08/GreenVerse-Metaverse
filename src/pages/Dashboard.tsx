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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1: Eco-Score */}
          <div className="glass-card p-6 glass-card-hover group relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl group-hover:bg-primary/20 group-hover:-translate-y-1 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Total Eco-Score</p>
              <h3 className="text-4xl font-extrabold text-foreground tracking-tight" style={{ textShadow: '0 4px 20px rgba(0,255,136,0.2)' }}>{ecoScore}</h3>
              <Progress value={min(100, (ecoScore / 500) * 100)} className="mt-5 h-1.5 bg-primary/10" />
            </div>
          </div>

          {/* Card 2: Tokens */}
          <div className="glass-card p-6 glass-card-hover group relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-success/10 border border-success/20 rounded-xl group-hover:bg-success/20 group-hover:-translate-y-1 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.15)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                <Award className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Eco-Tokens</p>
              <h3 className="text-4xl font-extrabold text-success tracking-tight" style={{ textShadow: '0 0 25px rgba(34,197,94,0.4)' }}>{ecoTokens}</h3>
              <p className="text-[11px] text-success/80 mt-2 font-bold tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Rewards
              </p>
            </div>
          </div>

          {/* Card 3: Assets */}
          <div className="glass-card p-6 glass-card-hover group relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group-hover:bg-emerald-500/20 group-hover:-translate-y-1 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <Globe className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Eco-Assets</p>
              <h3 className="text-4xl font-extrabold text-emerald-400 tracking-tight" style={{ textShadow: '0 0 25px rgba(16,185,129,0.4)' }}>{treesPlanted}</h3>
              <p className="text-[11px] text-emerald-500/80 mt-2 font-bold tracking-widest uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified On Polygon
              </p>
            </div>
          </div>

          {/* Card 4: Offset */}
          <div className="glass-card p-6 glass-card-hover group relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl group-hover:bg-cyan-500/20 group-hover:-translate-y-1 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                <Leaf className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Total Offset</p>
              <h3 className="text-4xl font-extrabold text-foreground tracking-tight" style={{ textShadow: '0 4px 20px rgba(6,182,212,0.2)' }}>
                {(treesPlanted * 22.5).toFixed(1)} <span className="text-lg font-bold text-muted-foreground">kg/yr</span>
              </h3>
              <p className="text-[10px] text-cyan-500 mt-2 font-mono uppercase tracking-widest bg-cyan-500/10 inline-block px-2 py-0.5 rounded border border-cyan-500/20">
                Atmospheric Sync Active
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Assets */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="glass-card p-8 min-h-[400px] border-t-primary/20">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="text-2xl font-bold font-heading tracking-wide">Impact Collection</h3>
                <Link to="/digital-forest">
                  <Button variant="ghost" className="text-primary hover:bg-primary/10 transition-colors uppercase text-xs tracking-widest font-bold">
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
                    <div key={tree.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 aspect-[4/3] flex flex-col justify-end p-6 cursor-pointer hover:border-primary/50 transition-colors duration-500 hover:shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060D1A] via-black/40 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-80"></div>
                      <img
                        src={imgSrc}
                        style={{ filter: `hue-rotate(${imgHue}deg)` }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-0 opacity-70"
                        alt={tree.treeType}
                        loading="lazy"
                      />

                      <div className="relative z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-primary/20 border border-primary/50 backdrop-blur-md rounded border-b-primary/80 text-[10px] uppercase font-black tracking-widest text-primary">Polygon NFT</span>
                          <span className="text-white/60 text-[10px] font-mono tracking-wider bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                            #{tree.tokenId.substring(0, 8)}…
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{tree.treeType}</h4>
                        <p className="text-xs text-primary font-medium tracking-wide uppercase">Minted {new Date(tree.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground bg-[rgba(16,185,129,0.02)] rounded-2xl border border-dashed border-primary/20 backdrop-blur-sm transition-all hover:bg-primary/5 hover:border-primary/40 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <TreePine className="w-10 h-10 text-primary opacity-80" />
                    </div>
                    <p className="text-lg font-bold text-foreground mb-2">No NFTs Minted Yet</p>
                    <p className="text-sm max-w-sm">Start your green journey by logging an eco-action to earn tokens and mint your first tree!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity / Rewards */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="glass-card p-8 h-full border-t-success/20">
              <h3 className="text-2xl font-bold font-heading mb-8 flex items-center gap-2 pb-4 border-b border-white/5 tracking-wide">
                <Clock className="w-5 h-5 text-success" /> Activity Log
              </h3>

              <div className="space-y-4">
                {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 group">
                    <div className={`p-3 rounded-xl border ${tx.status === 'Completed' ? 'bg-success/5 border-success/20 group-hover:bg-success/10' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                      <Award className={`w-5 h-5 ${tx.status === 'Completed' ? 'text-success' : 'text-yellow-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="font-bold text-sm text-foreground truncate">Eco-Token Reward</p>
                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${tx.status === 'Completed' ? 'bg-success/10 text-success border-success/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-primary mb-1">+{tx.amount} Tokens <span className="text-muted-foreground font-normal ml-2">{new Date(tx.createdAt).toLocaleDateString()}</span></p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 truncate cursor-help" title={`TxHash: ${tx.txHash}`}>TX: {tx.txHash}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-16 px-4 text-muted-foreground flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-sm">No activities logged yet.</p>
                  </div>
                )}
              </div>

              {transactions.length > 5 && (
                <Button variant="ghost" className="w-full mt-6 text-xs uppercase tracking-widest font-bold text-success hover:bg-success/10 transition-colors">
                  View Full History
                </Button>
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
