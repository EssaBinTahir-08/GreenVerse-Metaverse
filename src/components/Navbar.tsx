import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Leaf, Menu, X, Wallet, LogOut, Globe2, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/context/WalletContext";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const wallet = useWallet();

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  const handleConnectWallet = async () => {
    await wallet.connect();
    if (wallet.error) {
      toast({
        title: "Wallet Error",
        description: wallet.error,
        className: "bg-black/90 border border-destructive/50 text-white rounded-xl",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    wallet.disconnect();
    window.location.href = "/";
  };

  const [metaOpen, setMetaOpen] = useState(false);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (metaRef.current && !metaRef.current.contains(e.target as Node)) setMetaOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const metaLinks = [
    { to: '/metaverse', label: '🌍 3D World', desc: 'Walk the GreenVerse' },
    { to: '/vr-world', label: '🥽 VR Cinema', desc: 'Fly-through experience' },
    { to: '/plant-sensor', label: '📡 Plant Sensors', desc: 'Live IoT dashboard' },
    { to: '/land', label: '🗺️ Land Map', desc: 'Buy & own parcels' },
  ];

  const NavLinks = () => (
    <>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors font-medium">Dashboard</Link>
          <Link to="/submit-action" className="text-foreground/80 hover:text-primary transition-colors font-medium">Submit Proof</Link>
          <Link to="/marketplace" className="text-foreground/80 hover:text-primary transition-colors font-medium">Marketplace</Link>
          <Link to="/digital-forest" className="text-foreground/80 hover:text-primary transition-colors font-medium">Digital Forest</Link>
          <Link to="/leaderboard" className="text-foreground/80 hover:text-primary transition-colors font-medium">Leaderboard</Link>

          {/* Metaverse Dropdown */}
          <div ref={metaRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMetaOpen((o) => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: metaOpen ? 'rgba(0,255,136,0.1)' : 'transparent',
                border: `1px solid ${metaOpen ? '#00ff8844' : 'transparent'}`,
                borderRadius: 10, padding: '5px 12px', cursor: 'pointer',
                color: '#00ff88', fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
              }}
            >
              <Globe2 size={16} /> Metaverse <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: metaOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▾</span>
            </button>

            {metaOpen && (
              <div style={{
                position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(10,16,30,0.97)', border: '1px solid #00ff8822',
                borderRadius: 16, padding: '10px 8px', minWidth: 220, zIndex: 100,
                boxShadow: '0 10px 40px rgba(0,255,136,0.12)',
                backdropFilter: 'blur(20px)',
              }}>
                {metaLinks.map((ml) => (
                  <Link
                    key={ml.to} to={ml.to}
                    onClick={() => setMetaOpen(false)}
                    style={{
                      display: 'block', padding: '10px 14px', borderRadius: 12,
                      textDecoration: 'none', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,255,136,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13 }}>{ml.label}</div>
                    <div style={{ color: '#475569', fontSize: 11, marginTop: 1 }}>{ml.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {!isAuthenticated && (
        <>
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors font-medium">Home</Link>
          <Link to="/features" className="text-foreground/80 hover:text-primary transition-colors font-medium">Features</Link>
          <Link to="/vr-world" className="text-foreground/80 hover:text-primary transition-colors font-medium" style={{ color: '#00ff88' }}>🌍 Preview World</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/5 backdrop-blur-3xl border-b border-white/5 shadow-none">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all"></div>
              <Leaf className="w-8 h-8 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-heading font-bold gradient-text tracking-tight">GreenVerse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <NavLinks />
            </nav>

            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-foreground font-medium hover:text-primary hover:bg-primary/10">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="btn-eco">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Network warning */}
                  {wallet.isConnected && !wallet.isCorrectNetwork && (
                    <button
                      onClick={wallet.switchNetwork}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.5)',
                        borderRadius: 10, padding: '5px 10px', cursor: 'pointer',
                        color: '#fb923c', fontSize: 11, fontWeight: 700,
                      }}
                    >
                      <AlertTriangle className="w-3 h-3" /> Wrong Network
                    </button>
                  )}

                  <Button
                    variant="outline"
                    className={`font-medium ${
                      wallet.isConnected
                        ? wallet.isCorrectNetwork
                          ? 'border-success/50 text-success bg-success/10 hover:bg-success/20'
                          : 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                        : 'btn-outline-eco'
                    }`}
                    onClick={wallet.isConnected ? wallet.disconnect : handleConnectWallet}
                    disabled={wallet.isConnecting}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {wallet.isConnecting
                      ? 'Connecting…'
                      : wallet.isConnected
                        ? `${wallet.shortAddress}${wallet.balance ? ` · ${wallet.balance} MATIC` : ''}`
                        : 'Connect Wallet'
                    }
                  </Button>

                  <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2" onClick={handleLogout} title="Logout">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-4 animate-fade-in pb-2">
            <NavLinks />

            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-eco justify-center">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className={`w-full justify-center ${
                      wallet.isConnected ? 'border-success/50 text-success bg-success/10' : 'btn-outline-eco'
                    }`}
                    onClick={() => { if (!wallet.isConnected) handleConnectWallet(); setIsMenuOpen(false); }}
                    disabled={wallet.isConnecting}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {wallet.isConnecting ? 'Connecting…' : wallet.isConnected ? wallet.shortAddress! : 'Connect Wallet'}
                  </Button>
                  {wallet.isConnected && !wallet.isCorrectNetwork && (
                    <button onClick={wallet.switchNetwork} className="text-orange-400 text-xs font-bold text-center">
                      ⚠️ Switch to Polygon network
                    </button>
                  )}
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
