"use client";

import * as React from "react";
import { Plus, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BoardOnboarding } from "@/components/dashboard/BoardOnboarding";
import Link from "next/link";

const themes = [
  { name: "Blue", class: "bg-blue-600" },
  { name: "Purple", class: "bg-purple-600" },
  { name: "Emerald", class: "bg-emerald-600" },
  { name: "Orange", class: "bg-orange-600" },
  { name: "Rose", class: "bg-rose-600" },
  { name: "Slate", class: "bg-slate-700" },
];

export function BoardsList({ 
  boards, 
  showCreateCard = true 
}: { 
  boards: any[], 
  showCreateCard?: boolean 
}) {
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  const getThemeClass = (themeName: string) => {
    return themes.find((t) => t.name === themeName)?.class || "bg-slate-700";
  };

  return (
    <>
      <BoardOnboarding 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {showCreateCard && (
          <button 
            onClick={() => setIsOnboardingOpen(true)}
            className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 transition-all hover:border-blue-600/50 hover:bg-muted/50 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm transition-transform group-hover:scale-110">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-blue-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-blue-600 text-center">
              New Board
            </span>
          </button>
        )}

        {boards.map((board) => (
          <Link key={board.id} href={`/board/${board.slug}`}>
            <Card
              className="group relative h-32 overflow-hidden border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div className={`absolute inset-0 ${getThemeClass(board.background_color)} opacity-90 transition-opacity group-hover:opacity-100`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="relative flex h-full flex-col justify-between p-4 text-white">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold tracking-tight leading-tight">
                    {board.title}
                  </h3>
                  {board.is_starred && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/80">
                  <Clock className="h-3 w-3" />
                  <span>Created {new Date(board.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
