'use server'

import { createClient } from '@/lib/supabase/server'

export type ActivityAction = 
  | 'create_board'
  | 'delete_board'
  | 'create_list'
  | 'update_list'
  | 'delete_list'
  | 'create_card'
  | 'update_card'
  | 'delete_card'
  | 'move_card'
  | 'accept_invite'

export async function logActivity({
  boardId,
  cardId,
  action,
  payload = {},
}: {
  boardId: string
  cardId?: string
  action: ActivityAction
  payload?: any
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('Activity logging failed: No authenticated user')
    return { error: 'Unauthorized' }
  }

  // Include user info in the payload for redundancy and to avoid join errors
  const enrichedPayload = {
    ...payload,
    userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Someone',
    userAvatar: user.user_metadata?.avatar_url || null
  }

  const { error } = await supabase
    .from('activity')
    .insert([
      {
        board_id: boardId,
        card_id: cardId,
        user_id: user.id,
        action,
        payload: enrichedPayload,
      },
    ])

  if (error) {
    console.error(`Activity logging error (${action}):`, error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getActivities(boardId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activity')
    .select(`
      *,
      user:users!user_id ( id, name, avatar_url )
    `)
    .eq('board_id', boardId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }

  return data
}

export async function getDashboardActivities() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 1. Get all board IDs where user is owner or member
  const { data: owned } = await supabase.from('boards').select('id').eq('owner_id', user.id)
  const { data: memberOf } = await supabase.from('board_members').select('board_id').eq('user_id', user.id)

  const boardIds = Array.from(new Set([
    ...(owned?.map(b => b.id) || []),
    ...(memberOf?.map(m => m.board_id) || [])
  ]))

  if (boardIds.length === 0) return []

  // 2. Fetch activities
  const { data, error } = await supabase
    .from('activity')
    .select(`
      *,
      user:users!user_id ( id, name, avatar_url ),
      board:boards!board_id ( title, slug )
    `)
    .in('board_id', boardIds)
    .order('created_at', { ascending: false })
    .limit(15)

  if (error) {
    console.error('Error fetching dashboard activities:', error)
    return []
  }

  return data
}

export async function getAllActivities(limit: number = 100) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 1. Get all board IDs where user is owner or member
  const { data: owned } = await supabase.from('boards').select('id').eq('owner_id', user.id)
  const { data: memberOf } = await supabase.from('board_members').select('board_id').eq('user_id', user.id)

  const boardIds = Array.from(new Set([
    ...(owned?.map(b => b.id) || []),
    ...(memberOf?.map(m => m.board_id) || [])
  ]))

  if (boardIds.length === 0) return []

  // 2. Fetch activities
  const { data, error } = await supabase
    .from('activity')
    .select(`
      *,
      user:users!user_id ( id, name, avatar_url ),
      board:boards!board_id ( title, slug )
    `)
    .in('board_id', boardIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching all activities:', error)
    return []
  }

  return data
}
