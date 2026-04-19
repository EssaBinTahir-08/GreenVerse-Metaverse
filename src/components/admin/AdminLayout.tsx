import React from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

// FINAL STABLIZED COMPONENTS
const StableSidebar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin");
    };

    return (
        <aside className="w-72 h-full bg-[#050806] border-r border-emerald-900/20 flex flex-col z-50">
            <div className="p-8 border-b border-emerald-900/10">
                <h1 className="text-2xl font-black text-white tracking-tighter">GUARDIA</h1>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Status: Operational</p>
            </div>
            
            <nav className="flex-1 p-6 space-y-2">
                <Link to="/admin/review" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Oversight Queue
                </Link>
                <div className="pt-8 px-4">
                     <div className="h-[1px] bg-emerald-900/20 w-full mb-6"></div>
                     <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">System Protocols</p>
                     <ul className="mt-4 space-y-3 opacity-40">
                         <li className="text-[10px] uppercase font-bold text-slate-500">Node Cluster: Secure</li>
                         <li className="text-[10px] uppercase font-bold text-slate-500">Validator: Active</li>
                     </ul>
                </div>
            </nav>

            <div className="p-6 border-t border-emerald-900/10 mb-4">
                <button onClick={handleLogout} className="w-full p-4 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all text-sm">
                    Exit Command Center
                </button>
            </div>
        </aside>
    );
};

const StableHeader = () => {
    const userStr = localStorage.getItem("user");
    let user = { name: "Guardian" };
    try {
        user = userStr ? JSON.parse(userStr) : { name: "Guardian" };
    } catch(e) { /* silent fail */ }

    return (
        <header className="h-20 bg-[#050806]/50 backdrop-blur-xl border-b border-emerald-900/20 flex items-center justify-between px-10 z-40">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-mono text-emerald-500/60 uppercase tracking-[0.4em] font-bold">Meta-Commons Network Online</span>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                    <span className="text-[10px] text-emerald-500/60 font-bold uppercase">Senior Oversight Officer</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold">
                    {user.name?.charAt(0) || "G"}
                </div>
            </div>
        </header>
    );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/admin" replace />;

  return (
    <div className="flex h-screen w-full bg-[#050806] text-slate-200 overflow-hidden font-sans">
      <StableSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StableHeader />

        <main className="flex-1 overflow-y-auto relative scrollbar-hide">
          {/* Subtle noise and depth */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>
          
          <div className="p-10 max-w-[1600px] mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
