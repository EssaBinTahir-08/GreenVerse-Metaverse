import { motion, AnimatePresence } from "framer-motion";
import { Leaf, TreePine, ShieldCheck, Database, Zap, Globe } from "lucide-react";
import { useState, useEffect } from "react";

export const StoryIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [stage, setStage] = useState(0);
  const [glitchText, setGlitchText] = useState("");

  const texts = [
    "INITIALIZING NEURAL UPLINK...",
    "SYNTHESIZING ENVIRONMENTAL NODES...",
    "VERIFYING GUARDIAN PROTOCOLS...",
    "ENTERING THE META-COMMONS."
  ];

  useEffect(() => {
    // Stage 0 -> 1 (Establishing Connection)
    const t0 = setTimeout(() => setStage(1), 2000);
    // Stage 1 -> 2 (Synthesis)
    const t1 = setTimeout(() => setStage(2), 4000);
    // Stage 2 -> 3 (Security Check)
    const t2 = setTimeout(() => setStage(3), 6000);
    // Stage 3 -> End (Deployment)
    const t3 = setTimeout(() => onComplete(), 8500);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Subtle typewriter/glitch effect for current stage text
  useEffect(() => {
    let i = 0;
    const fullText = texts[stage] || "";
    setGlitchText("");
    
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setGlitchText((prev) => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [stage]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-hidden select-none"
      >
        {/* ================= HUD PERSISTENT DATA ================= */}
        <div className="absolute top-10 left-10 flex flex-col gap-2 font-mono text-[10px] text-emerald-500/40">
           <div className="flex items-center gap-2">
              <Zap className="w-3 h-3" />
              <span>PWR: OPTIMAL</span>
           </div>
           <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>LOC: 40.7128° N, 74.0060° W</span>
           </div>
        </div>

        <div className="absolute top-10 right-10 text-right font-mono text-[10px] text-emerald-500/40">
           <p>SYSTEM.VERSION_3.0.4</p>
           <p className="flex items-center gap-2 justify-end">
              <span>ENCRYPTED_LINK: ACTIVE</span>
              <ShieldCheck className="w-3 h-3" />
           </p>
        </div>

        <div className="absolute bottom-10 left-10 font-mono text-[10px] text-emerald-500/20 max-w-xs">
           <p>Initializing environmental proof-of-work protocols. Blockchain synchronization in progress. Please maintain neural focus.</p>
        </div>

        {/* ================= SCANLINE LAYER ================= */}
        <div className="absolute inset-0 scanline z-10 pointer-events-none opacity-[0.4]"></div>

        {/* ================= STAGE VISUALS ================= */}
        <div className="relative z-20 flex flex-col items-center">
            
            {/* CENTRAL ICON PORTAL */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-16">
               <motion.div 
                 animate={{ 
                     rotate: [0, 90, 180, 270, 360],
                     scale: [1, 1.05, 1],
                 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 border border-emerald-500/10 rounded-full"
               />
               <motion.div 
                 animate={{ 
                     rotate: [0, -90, -180, -270, -360],
                     scale: [1, 1.1, 1],
                 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-[10px] border border-emerald-500/5 rounded-full"
               />

               <AnimatePresence mode="wait">
                  {stage === 0 && (
                    <motion.div
                      key="uplink"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <Database className="w-20 h-20 text-emerald-500 animate-pulse drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                    </motion.div>
                  )}
                  {stage === 1 && (
                    <motion.div
                      key="synthesis"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <Leaf className="w-24 h-24 text-primary drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]" />
                    </motion.div>
                  )}
                  {stage === 2 && (
                    <motion.div
                      key="protocol"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <ShieldCheck className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.7)]" />
                    </motion.div>
                  )}
                  {stage === 3 && (
                    <motion.div
                      key="deployed"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="flex items-center justify-center"
                    >
                      <TreePine className="w-32 h-32 text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]" />
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* MESSAGE LAYER */}
            <div className="space-y-4 text-center">
               <motion.p
                 key={stage}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="font-mono text-xs text-emerald-500 uppercase tracking-[0.4em] font-black glitch-text h-6"
               >
                 {glitchText}
               </motion.p>
               
               <div className="flex justify-center gap-1">
                  {[0, 1, 2, 3].map((s) => (
                    <div 
                        key={s} 
                        className={`h-1 w-12 rounded-full transition-all duration-700 ${stage >= s ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-emerald-900/40"}`} 
                    />
                  ))}
               </div>
            </div>

        </div>

        {/* BACKGROUND 3D FEEL - Subtle Blur leakage */}
        <div className="absolute inset-0 z-[-1] opacity-30 blur-3xl scale-125 bg-gradient-to-tr from-emerald-950 via-black to-emerald-900"></div>

      </motion.div>
    </AnimatePresence>
  );
};
