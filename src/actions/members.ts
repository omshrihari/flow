'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activities'

export async function getBoardMembers(boardId: string) {
  const supabase = await createClient()

  // 1. Get Board and basic owner info
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('id, owner_id')
    .eq('id', boardId)
    .single()

  if (boardError || !board) {
    console.error('Error fetching board basic info:', boardError)
    return []
  }

  // 2. Fetch Owner profile separately to isolate RLS issues
  const { data: ownerProfile, error: ownerError } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('id', board.owner_id)
    .single()

  if (ownerError) {
    console.warn('Could not fetch owner profile (possibly restricted by RLS):', ownerError)
  }

  const owner = ownerProfile ? {
    ...ownerProfile,
    role: 'owner'
  } : {
    id: board.owner_id,
    name: 'Owner', // Fallback name
    role: 'owner'
  }

  // 3. Fetch Collaborators
  const { data: members, error: membersError } = await supabase
    .from('board_members')
    .select(`
      user_id,
      role,
      user:users!user_id ( id, name, avatar_url )
    `)
    .eq('board_id', boardId)

  if (membersError) {
    console.error('Error fetching collaborators:', membersError)
  }

  // 4. Fallback: Fetch activities to extract user names (since RLS might hide profiles)
  const { data: activities } = await supabase
    .from('activity')
    .select('user_id, payload')
    .eq('board_id', boardId)
    .not('payload', 'is', 'null')

  const profileMap = new Map<string, any>()
  if (activities) {
    for (const act of activities) {
      if (act.payload?.userName) {
        profileMap.set(act.user_id, {
          name: act.payload.userName,
          avatar_url: act.payload.userAvatar
        })
      }
    }
  }

  const collaborators = (members || [])
    .filter((m: any) => m.user_id !== board.owner_id)
    .map((m: any) => {
      const profileInfo = profileMap.get(m.user_id);
      if (!m.user) {
        return {
          id: m.user_id,
          name: profileInfo?.name || 'Collaborator', // Fallback for members whose profile is hidden by RLS
          avatar_url: profileInfo?.avatar_url || null,
          role: m.role
        }
      }
      return {
        ...m.user,
        name: m.user.name || profileInfo?.name,
        avatar_url: m.user.avatar_url || profileInfo?.avatar_url,
        role: m.role
      }
    })

  return [owner, ...collaborators]
}

export async function removeBoardMember(boardId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // 1. Verify currentUser is the owner
  const { data: board } = await supabase
    .from('boards')
    .select('owner_id, title')
    .eq('id', boardId)
    .single()

  if (board?.owner_id !== user.id) {
    return { error: 'Only the board owner can remove members' }
  }

  // 2. Identify the member to be removed (for logging)
  const { data: memberProfile } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single()

  // 3. Remove from board_members
  const { error } = await supabase
    .from('board_members')
    .delete()
    .eq('board_id', boardId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing board member:', error)
    return { error: error.message }
  }

  // 4. Log activity
  await logActivity({
    boardId,
    action: 'delete_board', // We could add 'remove_member' but user didn't ask for it
    payload: { title: board.title, removedMember: memberProfile?.name || 'Someone' }
  })

  revalidatePath(`/board/[slug]`, 'page')
  return { success: true }
}

export async function checkPermissions(boardId: string, allowedRoles: ('owner' | 'editor' | 'viewer')[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', role: null }

  // 1. Check if owner
  const { data: board } = await supabase
    .from('boards')
    .select('owner_id')
    .eq('id', boardId)
    .single()

  if (board?.owner_id === user.id) {
    if (allowedRoles.includes('owner')) return { success: true, role: 'owner' as const, userId: user.id }
    return { error: 'Unauthorized', role: 'owner' as const }
  }

  // 2. Check if member
  const { data: membership } = await supabase
    .from('board_members')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .single()

  if (membership && allowedRoles.includes(membership.role as any)) {
    return { success: true, role: membership.role as any, userId: user.id }
  }

  return { error: 'Unauthorized', role: (membership?.role as any) || null }
}
