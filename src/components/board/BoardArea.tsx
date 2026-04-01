"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { BoardColumn } from "./BoardColumn";
import { BoardCard } from "./BoardCard";
import { CardModal } from "./CardModal";
import { createList, deleteList, updateList } from "@/actions/lists";
import { createCard, updateCard, deleteCard } from "@/actions/cards";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface BoardAreaProps {
  boardId: string;
  initialLists: any[];
  initialCards: any[];
  role: "owner" | "editor" | "viewer";
}

export function BoardArea({ boardId, initialLists, initialCards, role }: BoardAreaProps) {
  const [lists, setLists] = useState<any[]>(initialLists);
  const [cards, setCards] = useState<any[]>(initialCards);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeColumn, setActiveColumn] = useState<any | null>(null);
  const [draggingCard, setDraggingCard] = useState<any | null>(null);

  const isViewer = role === "viewer";
  const canEdit = role === "owner" || role === "editor";

  // THE FIX: store the full pending card update, not just coords
  // This ref holds what we need to write to DB on drag end
  const pendingCardUpdate = useRef<{
    cardId: string;
    listId: string;
    position: number;
  } | null>(null);

  const selectedCard = useMemo(() =>
    cards.find(c => c.id === activeCardId),
  [cards, activeCardId]);

  const columns = useMemo(() => lists.map(list => ({
    id: list.id,
    title: list.title,
    cards: cards
      .filter(card => card.list_id === list.id)
      .sort((a, b) => a.position - b.position)
  })), [lists, cards]);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`board-${boardId}`) // unique channel name per board
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards", filter: `board_id=eq.${boardId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCards((prev) => {
              if (prev.find((c) => c.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === "UPDATE") {
            setCards((prev) =>
              prev.map((c) => c.id === payload.new.id ? { ...c, ...payload.new } : c)
            );
          } else if (payload.eventType === "DELETE") {
            setCards((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lists", filter: `board_id=eq.${boardId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLists((prev) => {
              if (prev.find((l) => l.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === "UPDATE") {
            setLists((prev) =>
              prev.map((l) => l.id === payload.new.id ? { ...l, ...payload.new } : l)
            );
          } else if (payload.eventType === "DELETE") {
            setLists((prev) => prev.filter((l) => l.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [boardId]);

  // ─── Drag handlers ───────────────────────────────────────

  function onDragStart(event: DragStartEvent) {
    if (isViewer) return;
    // Clear any stale pending update from previous drag
    pendingCardUpdate.current = null;

    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
    } else if (event.active.data.current?.type === "Card") {
      setDraggingCard(event.active.data.current.card);
    }
  }

  function onDragOver(event: DragOverEvent) {
    if (isViewer) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "Card";
    const isOverCard = over.data.current?.type === "Card";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveCard) return;

    setCards((prev) => {
      const activeCard = prev.find(c => c.id === activeId);
      if (!activeCard) return prev;

      let targetListId: string;
      let newPosition: number;

      if (isOverCard) {
        const overCard = prev.find(c => c.id === overId);
        if (!overCard) return prev;

        targetListId = overCard.list_id;

        // Get cards in the destination list, excluding the active card
        const destCards = prev
          .filter(c => c.list_id === targetListId && c.id !== activeId)
          .sort((a, b) => a.position - b.position);

        // Find where overCard sits in that filtered list
        const overIndexInDest = destCards.findIndex(c => c.id === overId);

        // Determine if we're dropping above or below the over card
        const isSameList = activeCard.list_id === targetListId;
        const activeIndexInDest = isSameList
          ? destCards.findIndex(c => c.id === activeId) // won't find since excluded
          : -1;

        // Insert active card at the correct spot
        const insertAt = overIndexInDest === -1 ? destCards.length : overIndexInDest;
        destCards.splice(insertAt, 0, { ...activeCard, list_id: targetListId });

        const finalIndex = destCards.findIndex(c => c.id === activeId);
        const prev_ = destCards[finalIndex - 1];
        const next_ = destCards[finalIndex + 1];

        if (!prev_ && !next_) newPosition = 1024;
        else if (!prev_) newPosition = next_.position / 2;
        else if (!next_) newPosition = prev_.position + 1024;
        else newPosition = (prev_.position + next_.position) / 2;

      } else if (isOverColumn) {
        targetListId = overId;

        // Dropping into an empty column or the column header
        const destCards = prev
          .filter(c => c.list_id === targetListId && c.id !== activeId)
          .sort((a, b) => a.position - b.position);

        newPosition = destCards.length > 0
          ? destCards[destCards.length - 1].position + 1024
          : 1024;
      } else {
        return prev;
      }

      // Store what we'll write to DB — this is always the latest drag position
      pendingCardUpdate.current = {
        cardId: activeId,
        listId: targetListId,
        position: newPosition,
      };

      // Optimistic UI update
      return prev.map(c =>
        c.id === activeId
          ? { ...c, list_id: targetListId, position: newPosition }
          : c
      );
    });
  }

  async function onDragEnd(event: DragEndEvent) {
    if (isViewer) return;
    const { active, over } = event;

    setActiveColumn(null);
    setDraggingCard(null);

    // ── Column reorder ──────────────────────────────────────
    if (active.data.current?.type === "Column") {
      if (!over || active.id === over.id) {
        pendingCardUpdate.current = null;
        return;
      }

      const activeIndex = lists.findIndex(l => l.id === active.id);
      const overIndex = lists.findIndex(l => l.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return;

      const newLists = arrayMove(lists, activeIndex, overIndex);
      setLists(newLists);

      const movedList = newLists[overIndex];
      const prevList = newLists[overIndex - 1];
      const nextList = newLists[overIndex + 1];

      let newPos = 1024;
      if (!prevList && nextList) newPos = nextList.position / 2;
      else if (prevList && !nextList) newPos = prevList.position + 1024;
      else if (prevList && nextList) newPos = (prevList.position + nextList.position) / 2;

      const result = await updateList(movedList.id, { position: newPos });
      if (result?.error) {
        toast.error("Failed to save list position");
        setLists(lists); // rollback
      }
      return;
    }

    // ── Card drop — write to DB ─────────────────────────────
    // THE CRITICAL FIX: read from ref, not from event
    // onDragOver has already updated the UI optimistically.
    // Now we just persist whatever the last onDragOver computed.
    const update = pendingCardUpdate.current;
    pendingCardUpdate.current = null; // clear immediately

    if (!update) return; // card didn't actually move

    const result = await updateCard(update.cardId, {
      list_id: update.listId,
      position: update.position,
    });

    if (result?.error) {
      toast.error("Failed to save card position");
      // Rollback optimistic update
      setCards(initialCards);
    }
  }

  // ─── List / Card CRUD ─────────────────────────────────────

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    setIsLoading(true);
    const position = (lists.length + 1) * 1024;
    const result = await createList(boardId, newListTitle, position);
    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setLists((prev) => {
        if (prev.find((l) => l.id === result.data.id)) return prev;
        return [...prev, result.data];
      });
      setNewListTitle("");
      setIsAddingList(false);
    }
    setIsLoading(false);
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Delete this list and all its cards?")) return;
    const result = await deleteList(listId);
    if (result.error) toast.error(result.error);
    else setLists(prev => prev.filter(l => l.id !== listId));
  };

  const handleAddCard = async (listId: string, title: string) => {
    const listCards = cards.filter(c => c.list_id === listId);
    const position = (listCards.length + 1) * 1024;
    const result = await createCard(boardId, listId, title, position);
    if (result.error) toast.error(result.error);
    else if (result.data) {
      setCards((prev) => {
        if (prev.find((c) => c.id === result.data.id)) return prev;
        return [...prev, result.data];
      });
    }
  };

  const handleUpdateCard = (updatedCard: any) => {
    if (isViewer) return;
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  const handleDeleteCard = async (cardId: string) => {
    if (isViewer) return;
    const result = await deleteCard(cardId);
    if (result.error) toast.error(result.error);
    else setCards(prev => prev.filter(c => c.id !== cardId));
  };

  return (
    <DndContext
      id="board-dnd-context"
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full w-full gap-4 pb-4 items-start overflow-x-auto custom-scrollbar">
        <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              role={role}
              onDelete={() => handleDeleteList(col.id)}
              onAddCard={(title) => handleAddCard(col.id, title)}
              onCardClick={(cardId) => setActiveCardId(cardId)}
            />
          ))}
        </SortableContext>

        {canEdit && (
          <div className="w-72 flex-shrink-0">
            {isAddingList ? (
              <div className="rounded-xl bg-black/20 p-3 shadow-lg backdrop-blur-md space-y-3 border border-white/10">
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddList()}
                  className="w-full rounded-md border-none bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-600 outline-none"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddList}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? "Adding..." : "Add list"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAddingList(false)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="flex w-full items-center gap-2 rounded-xl bg-black/20 backdrop-blur-md px-4 py-3 text-sm font-medium text-white hover:bg-black/30 transition-all active:scale-95 border border-white/5"
              >
                <Plus className="h-4 w-4" />
                Add another list
              </button>
            )}
          </div>
        )}
      </div>

      <DragOverlay>
        {activeColumn ? (
          <BoardColumn column={activeColumn} role={role} />
        ) : draggingCard ? (
          <BoardCard card={draggingCard} />
        ) : null}
      </DragOverlay>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          isOpen={!!activeCardId}
          onClose={() => setActiveCardId(null)}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
          role={role}
        />
      )}
    </DndContext>
  );
}