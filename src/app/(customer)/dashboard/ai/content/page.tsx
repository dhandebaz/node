"use client";

import { useState } from "react";
import { 
  Share2, 
  Globe, 
  MessageCircle, 
  Send, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { publishUnifiedPostAction } from "@/app/actions/meta-publishing";

export default function ContentHubPage() {
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [platforms, setPlatforms] = useState({
    facebook: true,
    instagram: true,
    threads: true
  });

  const handlePublish = async () => {
    if (!text && !mediaUrl) {
      toast.error("Please add some text or a media URL.");
      return;
    }

    if (platforms.instagram && !mediaUrl) {
        toast.error("Instagram requires a media URL (image/video).");
        return;
    }

    setIsPublishing(true);
    try {
      const result = await publishUnifiedPostAction({
        text,
        mediaUrl,
        platforms
      });

      if (result.success) {
        toast.success("Content published successfully!");
        setText("");
        setMediaUrl("");
      } else {
        toast.error(result.error || "Failed to publish content.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Share2 className="w-8 h-8 text-primary" />
            Content Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Compose and cross-post across all your Meta channels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <Card className="lg:col-span-2 glass-card border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Caption / Message</Label>
              <Textarea 
                id="caption"
                placeholder="What's on your business's mind?" 
                className="min-h-[150px] text-lg bg-muted/30 border-border/50 focus:border-primary/50"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Media URL (Image/Video)</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors">
                    <ImageIcon className="w-4 h-4" />
                </div>
                <input 
                  id="media"
                  type="text"
                  placeholder="Paste an image or video URL..."
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                Currently supports direct URLs. Supabase Storage integration coming soon.
              </p>
            </div>

            <div className="pt-4 flex justify-between items-center bg-muted/10 p-4 rounded-xl border border-border/50">
                <div className="flex -space-x-2">
                    {platforms.facebook && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-background ring-offset-2 ring-offset-background"><Globe className="w-4 h-4 text-white" /></div>}
                    {platforms.instagram && <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center ring-2 ring-background ring-offset-2 ring-offset-background"><MessageCircle className="w-4 h-4 text-white" /></div>}
                    {platforms.threads && <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center ring-2 ring-background ring-offset-2 ring-offset-background"><Share2 className="w-4 h-4 text-white" /></div>}
                </div>
                <Button 
                  onClick={handlePublish} 
                  disabled={isPublishing}
                  className="font-bold min-w-[140px]"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Now
                    </>
                  )}
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <div className="space-y-6">
          <Card className="glass-card border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Publish To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Facebook Page</div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active</div>
                  </div>
                </div>
                <Switch 
                  checked={platforms.facebook} 
                  onCheckedChange={(val) => setPlatforms(prev => ({ ...prev, facebook: val }))} 
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Instagram Business</div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active</div>
                  </div>
                </div>
                <Switch 
                  checked={platforms.instagram} 
                  onCheckedChange={(val) => setPlatforms(prev => ({ ...prev, instagram: val }))} 
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-400">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Threads</div>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active</div>
                  </div>
                </div>
                <Switch 
                  checked={platforms.threads} 
                  onCheckedChange={(val) => setPlatforms(prev => ({ ...prev, threads: val }))} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-none bg-primary/5">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-sm">Best Practices</h3>
                </div>
                <ul className="space-y-3">
                    <li className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        Use square images for best compatibility across FB and Instagram.
                    </li>
                    <li className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        Instagram captions work best under 2,200 characters.
                    </li>
                    <li className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        Threads supports longer text, but short and punchy gets more reach.
                    </li>
                </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
