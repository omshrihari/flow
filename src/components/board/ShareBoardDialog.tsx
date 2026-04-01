"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { createInviteLink } from "@/actions/invites";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ShareBoardDialog({ boardId }: { boardId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setInviteLink("");
    setIsCopied(false);

    const { data, error } = await createInviteLink(boardId, role);
    if (error || !data) {
      toast.error(error || "Failed to generate link");
    } else {
      const link = `${window.location.origin}/invite/${data}`;
      setInviteLink(link);
    }
    setIsLoading(false);
  };

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
          <UserPlus className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Share this board</DialogTitle>
          <DialogDescription>
            Generate a link to invite others to collaborate on this board.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label>Collaborator Role</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === "editor" ? "default" : "outline"}
                className={role === "editor" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                onClick={() => setRole("editor")}
              >
                Editor
              </Button>
              <Button
                type="button"
                variant={role === "viewer" ? "default" : "outline"}
                className={role === "viewer" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                onClick={() => setRole("viewer")}
              >
                Viewer
              </Button>
            </div>
          </div>

          {!inviteLink ? (
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-blue-600 text-white hover:bg-blue-700">
              {isLoading ? "Generating..." : "Generate Link"}
            </Button>
          ) : (
            <div className="flex flex-col space-y-2">
              <Label>Invite Link</Label>
              <div className="flex items-center space-x-2">
                <Input value={inviteLink} readOnly className="select-all" />
                <Button type="button" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="ghost" className="mt-2 text-xs text-muted-foreground" onClick={handleGenerate}>
                Generate a new link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
