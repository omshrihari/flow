'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activities'
import { getBoardBySlug } from './boards'
import crypto from 'crypto'

// CREATE INVITE LINK
export async function createInviteLink(boardId: string, role: 'editor' | 'viewer') {
  const supabase = await createClient()

  // Verify the user is the owner of the board
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('id, owner_id')
    .eq('id', boardId)
    .single()

  if (boardError || !board) return { error: 'Board not found' }
  if (board.owner_id !== user.id) return { error: 'Only the board owner can create invites' }

  // Generate secure token in Node.js to bypass Postgres encoding limitations
  const secureToken = crypto.randomBytes(24).toString('base64url')

  // Set expiry to 1 day from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  // Insert invite
  const { data, error } = await supabase
    .from('board_invites')
    .insert([
      {
        board_id: boardId,
        invited_by: user.id,
        role: role,
        token: secureToken,
        expires_at: expiresAt.toISOString(),
      }
    ])
    .select('token')
    .single()

  if (error) {
    console.error('Error creating invite:', error)
    return { error: `DB Error (Create): ${error.message} (Code: ${error.code})` }
  }

  return { data: data.token }
}

// GET INVITE DETAILS
export async function getInviteByToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('board_invites')
    .select(`
      *,
      boards ( id, title, owner_id, slug )
    `)
    .eq('token', token)
    .single()

  if (error) {
    console.error('Invite fetch error:', error);
    return { error: `DB Error (Fetch): ${error.message} (Code: ${error.code})` }
  }

  if (!data) {
    return { error: 'Invalid invitation link (not found in database)' }
  }

  // Check Expiry (if DB doesn't automatically delete)
  if (new Date(data.expires_at) < new Date()) {
    return { error: 'Invite link has expired' }
  }

  return { data }
}

// ACCEPT INVITE
export async function acceptInvite(token: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'You must be logged in to accept this invite' }
  }

  // 1. Fetch Invite
  const { data: invite, error: inviteError } = await getInviteByToken(token)
  if (inviteError || !invite) return { error: inviteError || 'Invite not found' }

  const boardId = invite.board_id;

  // 2. Check if user is already the owner
  if (invite.boards.owner_id === user.id) {
     return { data: { boardId, slug: invite.boards.slug } }
  }

  // 3. Insert into board_members
  const { error: memberError } = await supabase
    .from('board_members')
    .insert([
      {
         board_id: boardId,
         user_id: user.id,
         role: invite.role,
      }
    ])

  // It's possible the user is already a member (unique violation). In that case, we can proceed.
  if (memberError && memberError.code !== '23505') { 
    console.error('Error adding user to board_members:', memberError)
    return { error: 'Failed to join board' }
  }

  await logActivity({
    boardId,
    action: 'accept_invite',
    payload: { boardTitle: invite.boards.title, role: invite.role }
  })

  revalidatePath('/dashboard')
  
  return { data: { boardId, slug: invite.boards.slug } }
}
