import { getBoardBySlug } from "@/actions/boards";
import { getLists } from "@/actions/lists";
import { getCards } from "@/actions/cards";
import { BoardClient } from "@/components/board/BoardClient";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BoardPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = board.owner_id === user?.id;
  let role: "owner" | "editor" | "viewer" = isOwner ? "owner" : "viewer";

  if (!isOwner && user) {
    const { data: membership } = await supabase
      .from("board_members")
      .select("role")
      .eq("board_id", board.id)
      .eq("user_id", user.id)
      .single();

    if (membership) {
      role = (membership.role as "editor" | "viewer") || "viewer";
    }
  }

  const [lists, cards] = await Promise.all([
    getLists(board.id),
    getCards(board.id)
  ]);

  return (
    <BoardClient 
      board={board} 
      initialLists={lists} 
      initialCards={cards} 
      isOwner={isOwner} 
      role={role}
    />
  );
}
