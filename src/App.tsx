import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AdminLayout from "./components/admin/AdminLayout";
import { GlobalBackground } from "./components/GlobalBackground";
import { ImpactTicker } from "./components/ImpactTicker";

// Shared/Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Authenticated Pages
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import NFTTrees from "./pages/NFTTrees";
import Leaderboard from "./pages/Leaderboard";
import SubmitAction from "./pages/SubmitAction";
import AdminReview from "./pages/admin/AdminReview";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

// Public Route Guard (Redirects to dashboard if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Simple Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const UserLayout = () => (
  <div className="flex flex-col min-h-screen bg-transparent relative">
    <Navbar />
    <main className="flex-1 pt-24 pb-12 relative z-10 w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Global Auth Sanitizer
const sanitizeAuth = () => {
  try {
    const user = localStorage.getItem("user");
    if (user && user.includes("[object Object]")) {
      console.warn("Detected corrupted user data. Clearing...");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } else if (user) {
      JSON.parse(user);
    }
  } catch (e) {
    console.warn("Corrupted Auth data detected. Resetting session.");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
};
sanitizeAuth();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <GlobalBackground />
          <ImpactTicker />
          <div className="flex flex-col min-h-screen relative z-10">
            <Routes>
              {/* Public */}
              <Route path="/" element={<PublicRoute><Navbar /><main className="flex-1 pt-24"><Landing /></main><Footer /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Navbar /><main className="flex-1 pt-24"><Login /></main><Footer /></PublicRoute>} />
              <Route path="/register" element={<><Navbar /><main className="flex-1 pt-24"><Register /></main><Footer /></>} />
              
              {/* User Private */}
              <Route path="/dashboard" element={<ProtectedRoute><Navbar /><main className="flex-1 pt-24"><Dashboard /></main><Footer /></ProtectedRoute>} />
              <Route path="/submit-action" element={<ProtectedRoute><Navbar /><main className="flex-1 pt-24"><SubmitAction /></main><Footer /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Navbar /><main className="flex-1 pt-24"><Marketplace /></main><Footer /></ProtectedRoute>} />
              <Route path="/digital-forest" element={<ProtectedRoute><Navbar /><main className="flex-1 pt-24"><NFTTrees /></main><Footer /></ProtectedRoute>} />
              <Route path="/nft-trees" element={<Navigate to="/digital-forest" replace />} />
              <Route path="/my-assets" element={<Navigate to="/digital-forest" replace />} />
              <Route path="/leaderboard" element={<ProtectedRoute><Navbar /><main className="flex-1 pt-24"><Leaderboard /></main><Footer /></ProtectedRoute>} />
              
              {/* Admin Portal - STABILIZED */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/review" element={<AdminLayout><AdminReview /></AdminLayout>} />

              {/* Extras */}
              <Route path="/features" element={<><Navbar /><main className="flex-1 pt-24"><Features /></main><Footer /></>} />
              <Route path="/privacy" element={<><Navbar /><main className="flex-1 pt-24"><Privacy /></main><Footer /></>} />
              <Route path="/terms" element={<><Navbar /><main className="flex-1 pt-24"><Terms /></main><Footer /></>} />
              
              <Route path="/how-it-works" element={<Navigate to="/features" replace />} />
              <Route path="*" element={<><Navbar /><main className="flex-1 pt-24"><NotFound /></main><Footer /></>} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
