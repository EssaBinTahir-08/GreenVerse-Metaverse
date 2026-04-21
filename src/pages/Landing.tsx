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

      {/* ================= ECOSYSTEM FEATURES ================= */}
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

      {/* ================= METAVERSE ENTRY CTA ================= */}
      <section className="relative z-20 py-24 px-6" style={{ background: 'linear-gradient(180deg, #000 0%, #030d08 50%, #060d1a 100%)' }}>
        <div className="container mx-auto" style={{ maxWidth: 900, textAlign: 'center' }}>
          {/* Glow orb */}
          <div style={{
            width: 220, height: 220, borderRadius: '50%', margin: '0 auto 32px',
            background: 'radial-gradient(circle, rgba(0,255,136,0.25) 0%, rgba(0,255,136,0) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 72,
          }}>🌍</div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 50, padding: '6px 18px', marginBottom: 20,
            color: '#00ff88', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
          }}>
            🔴 LIVE — Metaverse v1.0 Online
          </div>

          <h2 style={{
            fontSize: 48, fontWeight: 900, margin: '0 0 16px',
            background: 'linear-gradient(135deg, #00ff88 0%, #4ade80 40%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}>
            Enter a World Where<br />Trees Are Currency
          </h2>

          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.8 }}>
            Walk through a bioluminescent 3D forest with your avatar. Own land parcels. Monitor real plant sensors. Trade NFT trees in a 3D marketplace. This is GreenVerse — a living, breathing metaverse.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            {[
              { icon: '🥽', text: 'WebXR VR Ready' },
              { icon: '🕹️', text: 'WASD Avatar' },
              { icon: '📡', text: 'Live IoT Sensors' },
              { icon: '🗺️', text: '100 Land Parcels' },
              { icon: '🌳', text: '4 Tree Species' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                background: 'rgba(15,23,42,0.8)', border: '1px solid #1e293b',
                borderRadius: 50, padding: '8px 16px',
                color: '#94a3b8', fontSize: 13, fontWeight: 600,
                display: 'flex', gap: 6, alignItems: 'center',
              }}>
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/vr-world" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '15px 34px', borderRadius: 16, fontSize: 16, fontWeight: 800,
                background: 'linear-gradient(135deg, #059669, #00ff88)',
                border: 'none', color: '#000', cursor: 'pointer',
                boxShadow: '0 0 40px rgba(0,255,136,0.3)',
                transition: 'all 0.2s',
              }}>
                🌍 Preview VR World
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '15px 34px', borderRadius: 16, fontSize: 16, fontWeight: 800,
                background: 'transparent', border: '1px solid rgba(0,255,136,0.4)',
                color: '#00ff88', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                🚀 Join GreenVerse
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
