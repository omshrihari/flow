'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { boardSchema } from '@/lib/validations/board'
import { slugify } from '@/lib/utils'
import { logActivity } from './activities'

export async function createBoard(formData: {
  title: string
  description?: string
  theme: string
}) {
  const supabase = await createClient()
  
  const validation = boardSchema.safeParse(formData)
  
  if (!validation.success) {
    console.error('Validation failed:', validation.error.issues)
    return { error: validation.error.issues[0].message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user found')
    return { error: 'Unauthorized' }
  }

  const slug = `${slugify(validation.data.title)}-${Math.random().toString(36).substring(2, 7)}`
  console.log('Inserting board:', { title: validation.data.title, owner_id: user.id, slug })

  const { data: board, error } = await supabase
    .from('boards')
    .insert([
      {
        title: validation.data.title,
        description: validation.data.description,
        background_color: validation.data.theme,
        owner_id: user.id,
        slug,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating board:', error)
    return { error: `Database Error: ${error.message} (Code: ${error.code})` }
  }

  // Create default lists
  const defaultLists = [
    { board_id: board.id, title: 'Tasks', position: 1024, is_archived: false },
    { board_id: board.id, title: 'In Process', position: 2048, is_archived: false },
    { board_id: board.id, title: 'Done', position: 3072, is_archived: false },
  ]

  const { error: listsError } = await supabase
    .from('lists')
    .insert(defaultLists)

  if (listsError) {
    console.error('Error creating default lists:', listsError)
  }

  console.log('Board created successfully:', board)
  
  await logActivity({
    boardId: board.id,
    action: 'create_board',
    payload: { title: board.title }
  })

  revalidatePath('/dashboard')
  return { data: board }
}

export async function getBoards() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { owned: [], collaborations: [] }

  const { data: ownedBoards, error: ownedError } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (ownedError) {
    console.error('Error fetching owned boards:', ownedError)
  }

  // Fetch shared boards
  const { data: memberships } = await supabase
    .from('board_members')
    .select('board_id')
    .eq('user_id', user.id)

  const memberBoardIds = memberships?.map((m: any) => m.board_id) || []
  
  // Filter out any IDs that are already in ownedBoards to be safe
  const ownedIds = new Set(ownedBoards?.map(b => b.id) || [])
  const collaborationIds = memberBoardIds.filter(id => !ownedIds.has(id))

  let collaborations: any[] = []

  if (collaborationIds.length > 0) {
    const { data: shared } = await supabase
      .from('boards')
      .select('*')
      .in('id', collaborationIds)
      .order('created_at', { ascending: false })
    
    if (shared) collaborations = shared
  }

  return {
    owned: ownedBoards || [],
    collaborations: collaborations || []
  }
}

export async function getBoardBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // First check if owner
  let { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .single()

  // If not owner, check if user is a member
  if (!data || error) {
    const { data: specificBoard } = await supabase
      .from('boards')
      .select('*')
      .eq('slug', slug)
      .single()

    if (specificBoard) {
      const { data: membership } = await supabase
        .from('board_members')
        .select('*')
        .eq('board_id', specificBoard.id)
        .eq('user_id', user.id)
        .single()
      
      if (membership) {
        data = specificBoard
        error = null
      }
    }
  }

  if (error || !data) {
    console.error('Error or unauthorized fetching board by slug:', error)
    return null
  }

  return data
}

export async function deleteBoard(boardId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: board } = await supabase
    .from("boards")
    .select("owner_id, title")
    .eq("id", boardId)
    .single()

  if (board?.owner_id !== user.id) {
    return { error: "Only the board owner can delete this board." }
  }

  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", boardId)

  if (error) {
    console.error("Error deleting board:", error)
    return { error: `Database Error: ${error.message}` }
  }

  await logActivity({
    boardId,
    action: 'delete_board',
    payload: { title: board?.title }
  })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateBoardBackground(boardId: string, background_color: string, slug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: board } = await supabase
    .from("boards")
    .select("owner_id")
    .eq("id", boardId)
    .single()

  if (board?.owner_id !== user.id) {
    return { error: "Only the board owner can change the background." }
  }

  const { error } = await supabase
    .from("boards")
    .update({ background_color })
    .eq("id", boardId)

  if (error) {
    console.error("Error updating board background:", error)
    return { error: `Database Error: ${error.message}` }
  }

  revalidatePath(`/board/${slug}`)
  revalidatePath("/dashboard")
  return { success: true }
}
