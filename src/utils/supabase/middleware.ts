import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

    // Protect all (admin) routes
    const isPublicRoute = request.nextUrl.pathname.startsWith('/loja') || request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.includes('.')
    
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware Error:', error)
    // If Supabase fails, allow the request to proceed (it will likely fail on the page itself if it needs auth)
    return NextResponse.next({
      request,
    })
  }
}
