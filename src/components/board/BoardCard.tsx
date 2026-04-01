import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlignLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardData = {
  id: string;
  title: string;
  description?: string;
  labels?: string[]; // Will be colors like "bg-red-500"
};

interface BoardCardProps {
  card: CardData;
  onClick?: () => void;
}

export function BoardCard({ card, onClick }: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className="opacity-30 p-3 rounded-xl border-2 border-dashed border-blue-600 bg-card shadow-sm h-[100px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-transparent bg-card p-3 text-sm text-card-foreground shadow-sm transition-all hover:border-blue-600/50 hover:shadow-md",
        isDragging && "opacity-50"
      )}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map((label, idx) => (
            <div key={idx} className={cn("h-2 w-10 rounded-full", label)} />
          ))}
        </div>
      )}
      <p className="font-medium text-foreground">{card.title}</p>
      
      {(card.description) && (
        <div className="flex items-center gap-2 text-muted-foreground mt-1 text-[10px]">
          {card.description && <AlignLeft className="h-3 w-3" />}
        </div>
      )}
    </div>
  );
}
