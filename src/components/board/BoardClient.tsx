"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BoardHeader } from "@/components/board/BoardHeader";
import { BoardArea } from "@/components/board/BoardArea";
import { BoardMenu } from "@/components/board/BoardMenu";
import { getBoardMembers } from "@/actions/members";
import { cn } from "@/lib/utils";

export const themes = [
  { name: "Blue", class: "bg-gradient-to-br from-blue-600 to-indigo-800" },
  { name: "Purple", class: "bg-gradient-to-br from-purple-600 to-indigo-800" },
  { name: "Emerald", class: "bg-gradient-to-br from-emerald-600 to-teal-800" },
  { name: "Orange", class: "bg-gradient-to-br from-orange-600 to-red-800" },
  { name: "Rose", class: "bg-gradient-to-br from-rose-600 to-pink-800" },
  { name: "Slate", class: "bg-gradient-to-br from-slate-700 to-slate-900" },
];

interface BoardClientProps {
  board: {
    id: string;
    title: string;
    background_color: string;
    slug: string;
    description: string | null;
  };
  initialLists: any[];
  initialCards: any[];
  isOwner: boolean;
  role: "owner" | "editor" | "viewer";
}

export function BoardClient({ board, initialLists, initialCards, isOwner, role }: BoardClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const fetchMembers = useCallback(async () => {
    const data = await getBoardMembers(board.id);
    setMembers(data);
  }, [board.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const themeClass = themes.find((t) => t.name === board.background_color)?.class || themes[0].class;

  return (
    <div className={cn("flex h-full flex-col text-white relative transition-colors duration-500", themeClass)}>
      <div className="force-light contents">
        <BoardHeader 
          boardId={board.id} 
          title={board.title} 
          onMenuClick={() => setIsMenuOpen(true)} 
          isOwner={isOwner}
          role={role}
          members={members}
          onMemberRemoved={fetchMembers}
        />
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          <BoardArea 
            boardId={board.id} 
            initialLists={initialLists} 
            initialCards={initialCards} 
            role={role}
          />
        </div>
      </div>
      <BoardMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        boardId={board.id} 
        isOwner={isOwner}
        role={role}
        description={board.description}
        slug={board.slug}
        currentBackground={board.background_color}
      />
    </div>
  );
}
