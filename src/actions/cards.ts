'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activities'
import { checkPermissions } from './members'

export async function getCards(boardId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('board_id', boardId)
    .eq('is_archived', false)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching cards:', error)
    return []
  }

  return data
}

export async function createCard(boardId: string, listId: string, title: string, position: number) {
  const perm = await checkPermissions(boardId, ['owner', 'editor'])
  if (perm.error) return { error: perm.error }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cards')
    .insert([
      {
        board_id: boardId,
        list_id: listId,
        title,
        position,
        is_archived: false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating card:', error)
    return { error: error.message }
  }

  if (data) {
    const { data: listData } = await supabase
      .from('lists')
      .select('title')
      .eq('id', listId)
      .single()

    await logActivity({
      boardId,
      cardId: data.id,
      action: 'create_card',
      payload: { title, list: listData?.title || 'Unknown' }
    })
  }

  // revalidatePath(`/board/[slug]`)
  return { data }
}

// actions/cards.ts
export async function updateCard(
  cardId: string,
  updates: {
    list_id?: string;
    position?: number;
    title?: string;
    description?: string;
    assignee_id?: string;
    due_date?: string;
  }
) {
  const supabase = await createClient();
  const { data: card } = await supabase.from('cards').select('board_id').eq('id', cardId).single()
  if (!card) return { error: 'Card not found' }

  const perm = await checkPermissions(card.board_id, ['owner', 'editor'])
  if (perm.error) return { error: perm.error }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Before update, if it's a move, get the current list title
  let oldListTitle = ""
  if (updates.list_id) {
    const { data: currentCard } = await supabase
      .from("cards")
      .select("list_id, lists(title)")
      .eq("id", cardId)
      .single()
    
    oldListTitle = (currentCard as any)?.lists?.title || "Unknown"
  }

  const { data, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", cardId)
    .select()
    .single();

  if (error) {
    console.error("Error updating card:", error);
    return { error: error.message };
  }

  if (data) {
    if (updates.list_id) {
      const { data: newList } = await supabase
        .from("lists")
        .select("title")
        .eq("id", updates.list_id)
        .single()

      await logActivity({
        boardId: data.board_id,
        cardId: data.id,
        action: 'move_card',
        payload: { 
          title: data.title, 
          fromList: oldListTitle, 
          toList: newList?.title || "Unknown" 
        }
      })
    } else if (updates.title) {
      await logActivity({
        boardId: data.board_id,
        cardId: data.id,
        action: 'update_card',
        payload: { title: updates.title }
      })
    }
  }

  return { data };
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient()
  
  const { data: card } = await supabase
    .from('cards')
    .select('board_id, title')
    .eq('id', cardId)
    .single()

  if (!card) return { error: 'Card not found' }

  const perm = await checkPermissions(card.board_id, ['owner', 'editor'])
  if (perm.error) return { error: perm.error }

  if (card) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting card:', error)
      return { error: error.message }
    }

    await logActivity({
      boardId: card.board_id,
      action: 'delete_card',
      payload: { title: card.title }
    })
  }

  return { error: null }
}
