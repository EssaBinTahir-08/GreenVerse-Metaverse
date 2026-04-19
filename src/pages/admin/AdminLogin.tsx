import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Map 'admin' username to the seeded email
      const email = formData.username === 'admin' ? 'admin@greenverse.io' : formData.username;

      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin authentication failed");
      }

      if (data.role !== 'admin') {
        throw new Error("Access denied. You do not have administrator privileges.");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      toast({
        title: "Access Granted",
        description: "Welcome to the GreenVerse Admin Command Center.",
      });

      setTimeout(() => {
        navigate("/admin/review");
      }, 500);
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center p-6 bg-black flex-col">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm mx-auto opacity-100 translate-y-0">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 border border-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-extrabold mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Authorized access only</p>
        </div>

        <div className="glass-card p-8 border-primary/20 bg-black/60 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder="admin"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                className="bg-white/5"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="bg-white/5"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-eco font-bold h-12"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isLoading ? "Verifying..." : "Enter Command Center"}
            </Button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-6 flex items-center justify-center text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>
        </div>

        <div className="mt-8 text-center text-[10px] text-muted-foreground/40 font-mono italic uppercase tracking-widest">
          System.Secure.Protocol.v3
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
