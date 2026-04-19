import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { Upload, Camera, Leaf, Droplets, Recycle, Zap, Bird, Sun, Waves } from "lucide-react";

const SubmitAction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !file) {
      toast.error("Please fill in all required fields and upload evidence.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("evidence", file);
    formData.append("notes", notes);

    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success("Submission successful! An admin will review it shortly.");
        navigate("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to submit.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-extrabold mb-4 gradient-text">Submit Eco-Action</h1>
        <p className="text-muted-foreground text-lg">Provide proof of your environmental impact to earn Eco-Tokens and NFTs.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle>Proof of Impact</CardTitle>
            <CardDescription>Upload a photo or document showing your completed activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Category Selection */}
            <div className="space-y-3">
              <Label htmlFor="category">Activity Category</Label>
              <Select onValueChange={setCategory} required>
                <SelectTrigger id="category" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1115] border-white/10 text-white">
                  <SelectItem value="recycling"><div className="flex items-center gap-2"><Recycle className="w-4 h-4 text-primary" /> Recycling</div></SelectItem>
                  <SelectItem value="energy_saving"><div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Energy Saving</div></SelectItem>
                  <SelectItem value="plantation"><div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-success" /> Tree Plantation</div></SelectItem>
                  <SelectItem value="cleanup"><div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-info" /> Ocean/Area Cleanup</div></SelectItem>
                  <SelectItem value="wildlife"><div className="flex items-center gap-2"><Bird className="w-4 h-4 text-orange-400" /> Wildlife Protection</div></SelectItem>
                  <SelectItem value="renewable"><div className="flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-300" /> Renewable Energy</div></SelectItem>
                  <SelectItem value="marine"><div className="flex items-center gap-2"><Waves className="w-4 h-4 text-cyan-400" /> Marine Preservation</div></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label>Evidence Upload (Image or PDF)</Label>
              <div
                className={`border-2 border-dashed border-white/10 rounded-xl p-8 text-center transition-all cursor-pointer hover:bg-white/5 ${preview ? 'border-primary/50' : ''}`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {preview ? (
                  <div className="relative group">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-2xl" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                      <p className="text-white font-medium">Change File</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG or PDF (max 5MB)</p>
                    </div>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes">Optional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Details about your action... (e.g. 'Planted 3 Oak trees in North Park')"
                className="bg-white/5 border-white/10 min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-between border-t border-white/10 pt-6">
            <Button variant="ghost" type="button" onClick={() => navigate("/dashboard")}>Cancel</Button>
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90 px-8"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Submit Proof
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default SubmitAction;
