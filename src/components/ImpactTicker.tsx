import React from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, TreePine, Award } from "lucide-react";

const IMPACT_EVENTS = [
  "PROTOCOL_SYNC: Amazon Meta-Node verified 14 new Oak saplings.",
  "GUARDIAN_ACTION: Submission #4928 approved for +150 ECO.",
  "NETWORK_UPDATE: CO2 Global Offset reached 42.8 Metric Tons.",
  "BLOCKCHAIN_LINK: New NFT Tree minted on Polygon Mainnet.",
  "COMMUNITY_GOAL: 84% towards the 'Great Barrier Sanctuary' milestone.",
  "SYSTEM_STATUS: Low-latency neural uplink active.",
];

export const ImpactTicker = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-8 bg-black/40 backdrop-blur-3xl border-t border-emerald-500/10 flex items-center overflow-hidden font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-500/60">
      
      {/* Ticker Container */}
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 items-center px-6"
      >
        {[...IMPACT_EVENTS, ...IMPACT_EVENTS].map((event, idx) => (
          <div key={idx} className="flex items-center gap-3">
             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
             <span>{event}</span>
             <div className="h-3 w-[1px] bg-emerald-500/10 mx-6"></div>
          </div>
        ))}
      </motion.div>

      {/* Persistent Status Indicators (Pinned to the right) */}
      <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-black via-black/80 to-transparent flex items-center px-6 gap-6 z-10 border-l border-emerald-500/5">
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-white/80">GUARDIAN_ONLINE</span>
         </div>
         <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-secondary animate-pulse" />
            <span className="text-white/80">LIVE_SYNC</span>
         </div>
      </div>
    </div>
  );
};
