"use client"

import { X, UserMinus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeBoardMember } from "@/actions/members"
import { toast } from "sonner"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Member {
  id: string
  name: string
  avatar_url: string | null
  role: string
}

interface CollaboratorsListProps {
  boardId: string
  members: Member[]
  isOwner: boolean
  onClose: () => void
  onMemberRemoved: () => void
}

export function CollaboratorsList({ 
  boardId, 
  members, 
  isOwner, 
  onClose,
  onMemberRemoved 
}: CollaboratorsListProps) {
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this collaborator?")) return

    setIsRemoving(userId)
    const res = await removeBoardMember(boardId, userId)
    setIsRemoving(null)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Collaborator removed")
      onMemberRemoved()
    }
  }

  return (
    <div className="absolute top-10 right-0 z-[60] w-72 rounded-xl border bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between border-b pb-3 mb-3">
        <h3 className="text-sm font-bold tracking-tight">Collaborators</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-800",
                member.role === 'owner' ? "bg-blue-600" : "bg-emerald-600"
              )}>
                {member.name ? member.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate max-w-[120px]">{member.name || "Unknown User"}</span>
                <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                  {member.role === 'owner' && <Shield className="h-2.5 w-2.5" />}
                  {member.role}
                </span>
              </div>
            </div>

            {isOwner && member.role !== 'owner' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                onClick={() => handleRemove(member.id)}
                disabled={isRemoving === member.id}
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
