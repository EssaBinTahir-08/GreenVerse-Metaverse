import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, TreePine, Award, Globe, Users, ChevronRight } from "lucide-react";
import { useState } from "react";
import { StoryIntro } from "@/components/StoryIntro";
import { AnimatePresence } from "framer-motion";

const features = [
  {
    title: "NFT Tree Planting",
    desc: "Mint unique NFT trees backed by real-world planting drives.",
    icon: TreePine,
  },
  {
    title: "Eco-Token Rewards",
    desc: "Earn tokens for recycling, saving energy, and community actions.",
    icon: Award,
  },
  {
    title: "Metaverse Integration",
    desc: "Visualize your impact in a persistent 3D environmental space.",
    icon: Globe,
  },
  {
    title: "Community Challenges",
    desc: "Compete on global leaderboards to maximize sustainability.",
    icon: Users,
  },
];

const Landing = () => {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("introPlayed");
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem("introPlayed", "true");
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden selection:bg-primary/30">
      <AnimatePresence>
        {showIntro && <StoryIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* ================= MISSION PORTAL HERO ================= */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl w-full">
           <div className="glass-card bg-black/40 backdrop-blur-2xl border-white/5 p-12 md:p-20 text-center rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.1)] transform hover:scale-[1.01] transition-all duration-700">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary font-mono text-[10px] uppercase tracking-[0.2em] mb-12 animate-fade-in">
                <Leaf className="w-3 h-3" />
                <span>Protocol Active: Genesis v1.0</span>
              </div>

              <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white">
                VIRTUAL ACTIONS.<br />
                <span className="text-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">REAL IMPACT.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
                The metaverse is no longer just a digital escape. It is the oversight layer for our planet's restoration. 
                Earn Eco-Tokens, mint verifiable life, and jump into the GreenVerse.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="btn-eco w-full sm:w-auto text-lg h-16 px-12 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all">
                    LOG IN OR SIGN UP <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Status Indicators */}
              <div className="mt-20 flex justify-center gap-12 border-t border-white/5 pt-12">
                 <div className="text-center">
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mb-1">Global Trees</p>
                    <p className="text-xl font-black text-white">12.4K+</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mb-1">Active ECO Tokens</p>
                    <p className="text-xl font-black text-white">842K</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mb-1">Network</p>
                    <p className="text-xl font-black text-emerald-500">SYNCED</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ================= OPTIONAL ECOSYSTEM SECTIONS ================= */}
      {/* (Kept minimal to maintain the Decentraland entry feel) */}
      <section className="relative z-20 py-32 bg-gradient-to-b from-transparent to-black px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, index) => (
              <div
                key={index}
                className="glass-card bg-white/[0.02] border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
