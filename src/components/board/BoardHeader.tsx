import { useState } from "react";
import { Star, AlignLeft, MoreHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShareBoardDialog } from "./ShareBoardDialog";
import { CollaboratorsList } from "./CollaboratorsList";
import { cn } from "@/lib/utils";

interface BoardHeaderProps {
  boardId?: string;
  title?: string;
  onMenuClick?: () => void;
  isOwner: boolean;
  role: "owner" | "editor" | "viewer";
  members: any[];
  onMemberRemoved: () => void;
}

export function BoardHeader({ 
  boardId, 
  title = "Project Alpha", 
  onMenuClick, 
  isOwner,
  role,
  members = [],
  onMemberRemoved
}: BoardHeaderProps) {
  const [showCollaborators, setShowCollaborators] = useState(false);

  return (
    <div className="flex h-14 w-full items-center justify-between border-b bg-background/50 px-4 backdrop-blur-md relative z-30 text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-2">
        <h1 className="cursor-pointer rounded-md px-2 py-1 text-lg font-bold hover:bg-muted/50">
          {title}
        </h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:bg-muted/50 transition-transform active:scale-95">
          <Star className="h-4 w-4 fill-yellow-400" />
        </Button>
        <div className="mx-2 h-4 w-px bg-border hidden sm:block" />
        <Button variant="ghost" className="h-8 px-2 text-sm font-medium hover:bg-muted/50 hidden sm:flex">
          <AlignLeft className="mr-2 h-4 w-4" />
          Board
        </Button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative">
          <button 
            className="flex -space-x-2 mr-2 hover:opacity-80 transition-all p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setShowCollaborators(!showCollaborators)}
          >
            {members.slice(0, 3).map((member, i) => (
              <div 
                key={member.id} 
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-background shadow-sm transition-transform hover:scale-110 hover:z-10",
                  member.role === 'owner' ? "bg-blue-600" : "bg-emerald-600"
                )}
                title={member.name}
              >
                {member.name ? member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U"}
              </div>
            ))}
            {members.length > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500 text-[10px] font-bold text-white ring-2 ring-background shadow-sm">
                +{members.length - 3}
              </div>
            )}
            <ChevronDown className="h-3 w-3 self-center ml-1 text-muted-foreground" />
          </button>
          
          {showCollaborators && boardId && (
            <CollaboratorsList 
              boardId={boardId}
              members={members}
              isOwner={isOwner}
              onClose={() => setShowCollaborators(false)}
              onMemberRemoved={onMemberRemoved}
            />
          )}
        </div>

        {boardId && isOwner && <ShareBoardDialog boardId={boardId} />}

        <div className="mx-1 h-4 w-px bg-border hidden sm:block" />
        
        <Button variant="ghost" size="sm" className="h-8 hover:bg-muted/50" onClick={onMenuClick}>
          <MoreHorizontal className="sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Show menu</span>
        </Button>

        <div className="mx-1 h-4 w-px bg-border" />

        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
