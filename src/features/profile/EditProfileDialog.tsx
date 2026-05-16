import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ProfileData } from "./types";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface EditProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	profile: ProfileData;
	onSave: () => void;
}

const EditProfileDialog = ({
	open,
	onOpenChange,
	profile,
	onSave,
}: EditProfileDialogProps) => {
	const [form, setForm] = useState<ProfileData>(profile);
	const [saving, setSaving] = useState(false);
	const { user } = useAuth();
	const queryClient = useQueryClient();

	useEffect(() => {
		setForm(profile);
	}, [profile]);

	const handleSave = async () => {
		if (!form.name.trim()) {
			toast.error("Name is required");
			return;
		}

		if (!user?.uid) {
			toast.error("Not authenticated");
			return;
		}

		setSaving(true);
		try {
			await updateDoc(doc(db, "users", user.uid), {
				name: form.name,
				bio: form.bio,
				isPublic: form.isPublic,
				"settings.privacy.profileVisibility": form.isPublic
					? "public"
					: "private",
			});

			await queryClient.invalidateQueries({
				queryKey: ["profile", "user", user.uid],
			});

			onSave();
			onOpenChange(false);
			toast.success("Profile updated successfully!");
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Avatar section */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <Avatar className="h-20 w-20 border-2 border-border">
								{user?.photoURL && (
									<AvatarImage src={user.photoURL} alt={form.name} />
								)}
                <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                  {form.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={160}
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {form.bio.length}/160
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Public Profile</p>
              <p className="text-xs text-muted-foreground">Allow others to see your profile</p>
            </div>
            <Switch
              checked={form.isPublic}
              onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={saving}
					>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
