import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Leaf, Menu, X, Wallet, LogOut, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(localStorage.getItem("walletAddress"));
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleStorageChange = () => {
      setWalletAddress(localStorage.getItem("walletAddress"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const userRaw = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    console.error("Navbar: User Data Corruption Detected", e);
  }
  const isAdmin = user?.role === 'admin';

  const handleConnectWallet = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);
        }
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to connect your wallet!",
        className: "bg-black/90 backdrop-blur-2xl border border-destructive/50 text-white rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.2)]",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("walletAddress");
    window.location.href = "/";
  };

  const NavLinks = () => (
    <>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors font-medium">Dashboard</Link>
          <Link to="/submit-action" className="text-foreground/80 hover:text-primary transition-colors font-medium">Submit Proof</Link>
          <Link to="/marketplace" className="text-foreground/80 hover:text-primary transition-colors font-medium">Marketplace</Link>
          <Link to="/digital-forest" className="text-foreground/80 hover:text-primary transition-colors font-medium">Digital Forest</Link>
          <Link to="/leaderboard" className="text-foreground/80 hover:text-primary transition-colors font-medium">Leaderboard</Link>
        </>
      )}
      {!isAuthenticated && (
        <>
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors font-medium">Home</Link>
          <Link to="/features" className="text-foreground/80 hover:text-primary transition-colors font-medium">Features</Link>
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
                  <Button
                    variant="outline"
                    className={`font-medium ${walletAddress ? "border-success/50 text-success bg-success/10 hover:bg-success/20" : "btn-outline-eco"}`}
                    onClick={walletAddress ? undefined : handleConnectWallet}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {walletAddress ? `${walletAddress.substring(0,6)}...${walletAddress.substring(walletAddress.length - 4)}` : "Connect Wallet"}
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
                    className={`w-full justify-center ${walletAddress ? "border-success/50 text-success bg-success/10" : "btn-outline-eco"}`}
                    onClick={() => { if(!walletAddress) handleConnectWallet(); setIsMenuOpen(false); }}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {walletAddress ? `${walletAddress.substring(0,6)}...${walletAddress.substring(walletAddress.length - 4)}` : "Connect Wallet"}
                  </Button>
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
