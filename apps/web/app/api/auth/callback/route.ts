import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Link any unlinked screening sessions to this user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Parse session ID from redirect URL if present
        try {
          const nextUrl = new URL(next, origin);
          const screeningSessionId = nextUrl.searchParams.get("session");
          if (screeningSessionId) {
            await supabase
              .from("screening_sessions")
              .update({ user_id: user.id })
              .eq("id", screeningSessionId)
              .is("user_id", null);
          }
        } catch {
          // Parse failed — continue
        }

        // Also link any sessions this user owns but have null user_id
        // (covers localStorage-based sessions from before login)
        await supabase
          .from("screening_sessions")
          .update({ user_id: user.id })
          .is("user_id", null)
          .order("completed_at", { ascending: false })
          .limit(1);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
