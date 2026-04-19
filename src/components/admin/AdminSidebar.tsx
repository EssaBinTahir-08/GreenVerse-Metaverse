import React from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  return (
    <aside className="w-64 h-full bg-black border-r border-white/10 flex flex-col p-6 z-50 relative">
      <h1 className="text-xl font-bold mb-10 text-white">GUARDIAN</h1>
      <nav className="flex-1 space-y-4">
        <Link to="/admin/review" className="block text-primary font-bold hover:underline">Review Queue</Link>
        <Link to="/admin/dashboard" className="block text-slate-400 hover:text-white transition-colors">Console Home</Link>
        <div className="pt-10 text-slate-600 text-[10px] font-mono uppercase tracking-widest">Oversight Protocols Active</div>
      </nav>
      <button onClick={handleLogout} className="text-red-500 text-sm text-left font-bold mt-auto pt-6 border-t border-white/5">Exit Console</button>
    </aside>
  );
};

export default AdminSidebar;
