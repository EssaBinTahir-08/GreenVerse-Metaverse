import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      toast({
        title: "Welcome Back",
        description: "You've successfully logged in to GreenVerse.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Connection refused. Is the backend running?",
        className: "bg-black/90 backdrop-blur-2xl border border-destructive/50 text-white rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.2)]",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-6 top-0 left-0 w-full z-20">

      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md mx-auto animate-slide-up">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-6 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all"></div>
            <Leaf className="w-10 h-10 text-primary relative z-10" />
          </Link>

          <h1 className="text-3xl font-heading font-extrabold mb-2 text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Continue logging your eco-impact.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-foreground/90 font-semibold">Email Address</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="min-h-[46px] bg-black/40 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground/90 font-semibold">Password</Label>
                <Link
                  to="/"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="min-h-[46px] bg-black/40 border-white/10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] btn-eco text-lg"
            >
              <Lock className="w-5 h-5 mr-2" />
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
