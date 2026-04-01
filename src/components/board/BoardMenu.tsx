"use client";

import { useState, useEffect } from "react";
import { X, AlignLeft, PaintBucket, Activity, Archive, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBoard, updateBoardBackground } from "@/actions/boards";
import { getActivities } from "@/actions/activities";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { themes } from "@/components/board/BoardClient";

interface BoardMenuProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  role: "owner" | "editor" | "viewer";
  description: string | null;
  slug: string;
  currentBackground: string;
}

export function BoardMenu({ boardId, isOpen, onClose, isOwner, role, description, slug, currentBackground }: BoardMenuProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickingBackground, setIsPickingBackground] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchActivities = async () => {
        setIsLoading(true);
        const data = await getActivities(boardId);
        setActivities(data);
        setIsLoading(false);
      };
      fetchActivities();
    }
  }, [isOpen, boardId]);

  if (!isOpen) return null;

  const renderActivityMessage = (activity: any) => {
    const { action, payload } = activity;
    
    switch (action) {
      case 'create_board':
        return <span>created board <span className="font-bold">{payload.title}</span></span>;
      case 'delete_board':
        return <span>deleted board <span className="font-bold">{payload.title}</span></span>;
      case 'create_list':
        return <span>created list <span className="font-bold">{payload.title}</span></span>;
      case 'update_list':
        return <span>renamed list to <span className="font-bold">{payload.title}</span></span>;
      case 'delete_list':
        return <span>deleted list <span className="font-bold">{payload.title}</span></span>;
      case 'create_card':
        return (
          <span>
            added <span className="font-bold">{payload.title}</span>
            {payload.list && (
              <> to <span className="font-bold">{payload.list}</span></>
            )}
          </span>
        );
      case 'update_card':
        return <span>updated card <span className="font-bold">{payload.title}</span></span>;
      case 'delete_card':
        return <span>deleted card <span className="font-bold">{payload.title}</span></span>;
      case 'move_card':
        return (
          <span>
            moved <span className="font-bold">{payload.title}</span>
            {payload.fromList && payload.toList && (
              <> from <span className="font-bold">{payload.fromList}</span> to <span className="font-bold">{payload.toList}</span></>
            )}
          </span>
        );
      case 'accept_invite':
        return <span>joined the board</span>;
      default:
        return <span>performed an action</span>;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-white/98 dark:bg-slate-900/98 backdrop-blur-md shadow-2xl transition-transform animate-in slide-in-from-right duration-300 flex flex-col text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight">Menu</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-all active:scale-95">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Info className="h-4 w-4" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-sm">About this board</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {description || "No description provided."}
                </p>
              </div>
            </button>
            {isOwner && (
              <div className="space-y-2">
                <button 
                  onClick={() => setIsPickingBackground(!isPickingBackground)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-all active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <PaintBucket className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Change background</p>
                    <p className="text-[11px] text-muted-foreground">Pick a color</p>
                  </div>
                </button>
                {isPickingBackground && (
                  <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                    {themes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={async () => {
                          const res = await updateBoardBackground(boardId, theme.name, slug);
                          if (res?.error) {
                            toast.error(res.error);
                          } else {
                            toast.success("Background updated!");
                          }
                        }}
                        className={`h-16 rounded-lg shadow-sm border-2 transition-transform hover:scale-105 ${theme.class} ${currentBackground === theme.name ? 'border-blue-500' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-dashed">
              <Activity className="h-3 w-3" />
              Activity Feed
            </h3>
            
            <div className="space-y-6">
              {isLoading ? (
                <p className="text-xs text-muted-foreground px-2">Loading activity...</p>
              ) : activities.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2">No activity yet.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="group flex gap-4 text-sm relative">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs border shadow-sm group-hover:scale-110 transition-transform">
                      {(activity.user?.name || activity.payload?.userName || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="leading-snug">
                        <span className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer">
                          {activity.user?.name || activity.payload?.userName || "Someone"}
                        </span>
                        <span className="text-muted-foreground mx-1">
                          {renderActivityMessage(activity)}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-emerald-500" />
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="p-6 border-t bg-muted/30 space-y-3">
            <Button className="w-full bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 py-6 rounded-xl font-bold shadow-md flex items-center justify-center gap-2">
              <Archive className="h-4 w-4" />
              Archive Board
            </Button>
            <Button 
              variant="destructive" 
              className="w-full py-6 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
              onClick={async () => {
                if (confirm("Are you sure you want to completely delete this board? This action cannot be undone.")) {
                  const res = await deleteBoard(boardId);
                  if (res?.error) {
                    toast.error(res.error);
                  } else {
                    toast.success("Board permanently deleted");
                    window.location.href = "/dashboard";
                  }
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Board
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
