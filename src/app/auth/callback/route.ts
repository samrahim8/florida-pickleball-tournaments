import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has a profile/organizer record
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: organizer } = await supabase
          .from('organizers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        // If they have an organizer profile, go to submit page
        // Otherwise, go to onboarding
        const redirectTo = organizer ? '/submit' : '/onboarding'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  // Return to home page on error
  return NextResponse.redirect(`${origin}/signin?error=auth_error`)
}
