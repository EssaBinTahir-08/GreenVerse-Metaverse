import React from "react";

export const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Immersive Overlay Hierarchy */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-[3]"></div>
      <div className="absolute inset-0 bg-emerald-950/30 backdrop-brightness-75 z-[2]"></div>
      
      {/* Meta-Noise Surface (Subtle Texture) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[4]"></div>

      {/* Persistence Engine: Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="w-full h-full object-cover scale-[1.02] animate-slow-zoom opacity-50 contrast-[1.1] saturate-[1.2]"
        poster="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-river-in-the-sunshine-601-large.mp4" type="video/mp4" />
      </video>
    </div>
  );
};
