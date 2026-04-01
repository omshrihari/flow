import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  const publicRoutes = ['/', '/login', '/sign-up']
  const isPublicRoute = publicRoutes.includes(pathname)
  const isApiAuthRoute = pathname.startsWith('/api/auth')
  const isAuthCallback = pathname.startsWith('/auth/callback')

  let redirectUrl: URL | null = null

  if (
    !user &&
    !isPublicRoute &&
    !isAuthCallback &&
    !pathname.startsWith('/_next') &&
    !isApiAuthRoute
  ) {
    // Redirect unauthenticated users to login
    // Preserve the current path as ?next= so we return here after login
    redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)

  } else if (user && (pathname === '/login' || pathname === '/sign-up')) {
    // Logged-in user visiting auth pages
    // If there's a ?next= param, honor it — otherwise go to dashboard
    const next = searchParams.get('next')
    const destination = next && next.startsWith('/') ? next : '/dashboard'
    redirectUrl = new URL(destination, request.url)
  }

  if (redirectUrl) {
    const finalResponse = NextResponse.redirect(redirectUrl)
    // Preserve any cookies set by Supabase during this request
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value)
    })
    return finalResponse
  }

  return supabaseResponse
}