'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activities'
import { checkPermissions } from './members'

export async function getLists(boardId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('board_id', boardId)
    .eq('is_archived', false)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching lists:', error)
    return []
  }

  return data
}

export async function createList(boardId: string, title: string, position: number) {
  const perm = await checkPermissions(boardId, ['owner', 'editor'])
  if (perm.error) return { error: perm.error }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lists')
    .insert([
      {
        board_id: boardId,
        title,
        position,
        is_archived: false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating list:', error)
    return { error: error.message }
  }

  await logActivity({
    boardId,
    action: 'create_list',
    payload: { title }
  })

  revalidatePath(`/board/[slug]`)
  return { data }
}

export async function deleteList(listId: string) {
  const supabase = await createClient()
  
  const { data: list } = await supabase
    .from('lists')
    .select('board_id, title')
    .eq('id', listId)
    .single()

  if (!list) return { error: 'List not found' }

  const perm = await checkPermissions(list.board_id, ['owner', 'editor'])
  if (perm.error) return { error: perm.error }

  if (list) {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)

    if (error) {
      console.error('Error deleting list:', error)
      return { error: error.message }
    }

    await logActivity({
      boardId: list.board_id,
      action: 'delete_list',
      payload: { title: list.title }
    })
  }

  revalidatePath(`/board/[slug]`)
  return { error: null }
}

export async function updateList(listId: string, updates: any) {
  const supabase = await createClient()
  const { data: list } = await supabase.from('lists').select('board_id').eq('id', listId).single()
  if (!list) return { error: 'List not found' }

  const perm = await checkPermissions(list.board_id, ['owner', 'editor'])
  if (perm.error) return { error: perm.error }

  const { data, error } = await supabase
    .from('lists')
    .update(updates)
    .eq('id', listId)
    .select()
    .single()

  if (error) {
    console.error('Error updating list:', error)
    return { error: error.message }
  }

  if (data && updates.title) {
    await logActivity({
      boardId: data.board_id,
      action: 'update_list',
      payload: { title: updates.title }
    })
  }

  return { data }
}

