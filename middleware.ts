import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check auth condition
    if (!session && (req.nextUrl.pathname.startsWith("/profile") || req.nextUrl.pathname.startsWith("/checkout"))) {
      // Redirect to login if accessing protected routes without session
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Auth error in middleware:", error)

    // If there's an auth error, clear the session and redirect to login for protected routes
    if (req.nextUrl.pathname.startsWith("/profile") || req.nextUrl.pathname.startsWith("/checkout")) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
