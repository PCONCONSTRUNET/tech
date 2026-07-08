import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
  const isAdminRoute = !request.nextUrl.pathname.startsWith('/loja') 
    && !request.nextUrl.pathname.startsWith('/login')
    && !request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
    && request.nextUrl.pathname !== '/'; // Assuming root '/' might be admin or public. Actually let's be explicit:

  // If the user is trying to access an admin route (e.g. /products, /pos, /customers, /os, /finance...) 
  // without being logged in, redirect to /login
  // By default in this app, non-public routes are admin routes.
  const isPublicRoute = request.nextUrl.pathname.startsWith('/loja') || request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.includes('.')
  
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
