import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import { BoardCard, CardData } from "./BoardCard";
import { Button } from "@/components/ui/button";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export type ColumnData = {
  id: string;
  title: string;
  cards: CardData[];
};

interface BoardColumnProps {
  column: ColumnData;
  role: "owner" | "editor" | "viewer";
  onDelete?: () => void;
  onAddCard?: (title: string) => void;
  onCardClick?: (cardId: string) => void;
}

export function BoardColumn({ column, role, onDelete, onAddCard, onCardClick }: BoardColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const canEdit = role === "owner" || role === "editor";
  const isViewer = role === "viewer";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: isViewer,
    data: {
      type: "Column",
      column,
    },
  });

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    onAddCard?.(newCardTitle);
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="opacity-50 h-[500px] w-72 rounded-xl bg-card/50 border-2 border-dashed border-blue-600 flex-shrink-0"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex h-full max-h-full w-72 flex-shrink-0 flex-col rounded-xl bg-black/20 backdrop-blur-md pb-2"
    >
      {/* Column Handle and Header */}
      <div 
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between p-3 pb-2 active:cursor-grabbing text-white"
      >
        <h2 className="font-bold text-sm leading-tight pl-1">
          {column.title}
        </h2>
        <div className="flex items-center gap-1">
          {canEdit && (
            <Button 
              variant="ghost" 
              size="icon-xs" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="h-6 w-6 text-white/60 hover:text-red-400 hover:bg-white/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon-xs" className="h-6 w-6 text-white hover:bg-white/20">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sortable Cards Container */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 min-h-[50px] custom-scrollbar">
        <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <BoardCard key={card.id} card={card} onClick={() => onCardClick?.(card.id)} />
          ))}
        </SortableContext>
      </div>

      {/* Add Card Footer */}
      {canEdit && (
        <div className="px-2 pt-2">
          {isAddingCard ? (
            <div className="space-y-2 p-1">
              <textarea
                autoFocus
                placeholder="Enter a title for this card..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCard();
                  }
                }}
                className="w-full min-h-[60px] rounded-lg bg-white p-2 text-sm text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAddCard} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add card
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsAddingCard(false)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              onClick={() => setIsAddingCard(true)}
              className="w-full justify-start text-white/90 hover:bg-white/20 hover:text-white rounded-lg h-9"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add a card
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
