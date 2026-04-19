import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Eye, Clock, User, ExternalLink, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const AdminReview = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [decisionReason, setDecisionReason] = useState("");

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/submissions/pending", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        } else if (response.status === 401) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch pending submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [navigate]);

  const handleReview = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const response = await fetch(`http://localhost:5001/api/submissions/${id}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status, decisionReason })
      });

      if (response.ok) {
        toast.success(`Submission ${status.toLowerCase()} successfully.`);
        setSubmissions(submissions.filter(s => s.id !== id));
        setDecisionReason("");
        setReviewingId(null);
      } else {
        toast.error("Failed to update submission.");
      }
    } catch (error) {
      toast.error("Error processing review.");
    }
  };

  return (
    <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white flex items-center gap-4">
            <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30">
              <ShieldCheck className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
            </div>
            Oversight Queue
          </h1>
          <p className="text-slate-400 mt-3 text-lg border-l-2 border-primary/30 pl-4">
            Validate neural environmental evidence and authorize blockchain rewards.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{submissions.length} Pending</span>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card className="bg-black/40 border-white/5 p-20 text-center rounded-[2rem] backdrop-blur-sm border-dashed">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Queue Clear</h3>
          <p className="text-slate-500">No pending submissions require your attention. All ecosystems are stable.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {submissions.map((sub) => (
            <Card key={sub.id} className="bg-black/60 border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-500 group">
              <div className="flex flex-col lg:flex-row h-full">
                {/* Evidence Image */}
                <div className="lg:w-72 h-64 lg:h-auto relative group flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                  <img
                    src={`http://localhost:5001${sub.evidenceUrl}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Evidence"
                  />

                  {/* Category Overlay */}
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-primary text-white font-bold px-3 py-1 rounded-lg shadow-lg uppercase text-[10px] tracking-widest">
                      {sub.category.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm bg-black/40">
                    <a href={`http://localhost:5001${sub.evidenceUrl}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="secondary" className="gap-2 rounded-xl h-11 px-6 font-bold">
                        <Eye className="w-4 h-4" /> Inspect Alpha
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Info */}
                <CardContent className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold">
                          {sub.user?.displayName?.charAt(0) || "G"}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">
                            {sub.user?.displayName || "Guardian"}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono mt-1">
                            {sub.user?.walletAddress ? `${sub.user.walletAddress.slice(0, 8)}...${sub.user.walletAddress.slice(-6)}` : "OFF-CHAIN"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl mb-6">
                      <p className="text-slate-300 text-sm leading-relaxed italic">
                        {sub.notes ? `"${sub.notes}"` : "Proof submitted without supplemental notes."}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.2)]">
                          <Check className="w-4 h-4" /> Authorize
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0a0f0b] border-white/10 text-white rounded-[2rem] max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Authorize Reward</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Blockchain protocols will issue 50 ECT and mint a genesis tree upon authorization.
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          placeholder="Public recognition note... (Optional)"
                          className="bg-black/40 border-white/10 rounded-2xl h-24 focus:border-primary/50"
                          value={decisionReason}
                          onChange={(e) => setDecisionReason(e.target.value)}
                        />
                        <DialogFooter className="gap-3">
                          <Button variant="ghost" onClick={() => setDecisionReason("")} className="hover:bg-white/5">Cancel</Button>
                          <Button onClick={() => handleReview(sub.id, "Approved")} className="bg-primary text-white font-bold px-8 rounded-xl">Release Protocol</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10 h-12 rounded-xl gap-2 transition-all">
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0a0f0b] border-white/10 text-white rounded-[2rem] max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Reject Evidence</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            State the reason for non-compliance. This action is final.
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          placeholder="e.g. Evidence does not meet quality standards."
                          className="bg-black/40 border-white/10 rounded-2xl h-24 focus:border-red-500/50"
                          value={decisionReason}
                          onChange={(e) => setDecisionReason(e.target.value)}
                          required
                        />
                        <DialogFooter className="gap-3">
                          <Button variant="ghost" className="hover:bg-white/5">Cancel</Button>
                          <Button
                            onClick={() => handleReview(sub.id, "Rejected")}
                            disabled={!decisionReason}
                            variant="destructive"
                            className="px-8 rounded-xl font-bold"
                          >
                            Confirm Rejection
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReview;
