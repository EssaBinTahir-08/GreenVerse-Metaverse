import React from "react";

const AdminHeader = () => {
  const userStr = localStorage.getItem("user");
  let user = { name: "Guardian" };
  try {
    user = userStr ? JSON.parse(userStr) : { name: "Guardian" };
  } catch (e) {
    console.error("AdminHeader: Data Error", e);
  }

  return (
    <header className="h-20 border-b border-white/10 flex items-center justify-between px-10 bg-black z-40 relative">
      <div className="flex-1 text-xs font-mono text-primary uppercase tracking-[0.3em] font-bold">
        GreenVerse Guardian Console
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
             <p className="text-sm font-bold text-white leading-none">{user.name}</p>
             <p className="text-[10px] text-primary/60 font-bold uppercase mt-1 tracking-tighter">Authorized Session</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
