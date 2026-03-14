import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Twitter, Facebook, MessageCircle, Link2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  stats: { totalDeeds: number; currentStreak: number; level: string };
}

const ShareProfileDialog = ({ open, onOpenChange, profileName, stats }: ShareProfileDialogProps) => {
  const [copied, setCopied] = useState(false);

  const profileUrl = window.location.href;
  const shareText = `🌿 ${profileName} has logged ${stats.totalDeeds} good deeds on Hasanat with a ${stats.currentStreak}-day streak! Level: ${stats.level} ✨`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyStats = async () => {
    await navigator.clipboard.writeText(shareText);
    toast.success("Stats copied! Paste it anywhere.");
  };

  const socials = [
    {
      name: "Twitter / X",
      icon: Twitter,
      color: "hover:bg-sky-500/10 hover:text-sky-500",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
          "_blank"
        ),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "hover:bg-blue-600/10 hover:text-blue-600",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`,
          "_blank"
        ),
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "hover:bg-green-500/10 hover:text-green-500",
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + profileUrl)}`,
          "_blank"
        ),
    },
    {
      name: "Telegram",
      icon: Send,
      color: "hover:bg-sky-400/10 hover:text-sky-400",
      onClick: () =>
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
          "_blank"
        ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Preview card */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center space-y-2">
            <p className="text-3xl">🌿</p>
            <p className="font-semibold text-foreground">{profileName}</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalDeeds} deeds · {stats.currentStreak}-day streak · {stats.level}
            </p>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-4 gap-2">
            {socials.map((s) => (
              <Button
                key={s.name}
                variant="outline"
                className={`flex flex-col items-center gap-1.5 h-auto py-3 transition-colors ${s.color}`}
                onClick={s.onClick}
              >
                <s.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{s.name}</span>
              </Button>
            ))}
          </div>

          <Separator />

          {/* Copy link */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Profile Link</p>
            <div className="flex gap-2">
              <Input value={profileUrl} readOnly className="text-xs" />
              <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Copy stats text */}
          <Button variant="secondary" className="w-full gap-2 text-xs" onClick={handleCopyStats}>
            <Link2 className="h-3.5 w-3.5" /> Copy Stats as Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProfileDialog;
