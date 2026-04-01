import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { getURL } from '@/lib/utils/url'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      if ((await supabase.auth.getUser()).data.user) {
         return NextResponse.redirect(`${getURL()}${next.startsWith('/') ? next.slice(1) : next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${getURL()}login?error=Could not authenticate user`)
}
