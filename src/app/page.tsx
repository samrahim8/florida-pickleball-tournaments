import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TournamentCard from '@/components/TournamentCard'
import NewsletterSignup from '@/components/NewsletterSignup'
import HomeFilters from '@/components/HomeFilters'
import { createClient } from '@/lib/supabase-server'
import { Tournament } from '@/types/database'

async function getUpcomingTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'approved')
    .gte('date_end', new Date().toISOString().split('T')[0])
    .order('date_start', { ascending: true })
    .limit(8)

  if (error) {
    console.error('Error fetching upcoming tournaments:', error)
    return []
  }

  // Sort so featured tournaments come first, then by date
  const tournaments = (data || []) as Tournament[]
  return tournaments.sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  })
}

export default async function Home() {
  const upcoming = await getUpcomingTournaments()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7F2] via-[#FAF7F2] to-[#F5F0E8]" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="max-w-3xl">
            <p className="text-[#C4704A] font-medium tracking-wide uppercase text-sm mb-4">
              The Sunshine State&apos;s Premier Directory
            </p>
            <h1 className="text-4xl md:text-6xl leading-tight tracking-tight text-[#2C2C2C]">
              Discover Pickleball{' '}
              <span className="italic">Tournaments</span>{' '}
              <span className="text-[#C4704A]">in Florida</span>
            </h1>
            <p className="mt-6 text-lg text-[#6B6560] leading-relaxed max-w-xl">
              From the courts of South Florida to the Panhandle.
              Find your next competition, connect with the community.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/tournaments" className="btn-primary">
                Browse Tournaments
              </Link>
              <Link href="/submit" className="btn-secondary">
                List Your Tournament
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="py-6 border-y border-[#E8E2D9] bg-[#FFFDF9]">
        <div className="max-w-6xl mx-auto px-4">
          <HomeFilters />
        </div>
      </section>

      <main className="flex-grow">
        {/* Upcoming Tournaments */}
        <section className="py-20 bg-[#FFFDF9]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl text-[#2C2C2C]">
                  Upcoming Tournaments
                </h2>
                <p className="text-[#9A948D] mt-2">
                  {upcoming.length} tournaments on the calendar
                </p>
              </div>
              <Link
                href="/tournaments"
                className="hidden sm:inline-flex items-center gap-2 text-[#C4704A] hover:text-[#A85D3B] font-medium transition-colors"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {upcoming.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {upcoming.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : (
              <div className="card p-16 text-center">
                <div className="w-16 h-16 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl text-[#2C2C2C] mb-2">No Upcoming Tournaments</h3>
                <p className="text-[#6B6560] mb-8 max-w-sm mx-auto">
                  Be the first to list a tournament and connect with players across Florida.
                </p>
                <Link href="/submit" className="btn-primary">
                  Submit a Tournament
                </Link>
              </div>
            )}

            <div className="sm:hidden mt-10 text-center">
              <Link
                href="/tournaments"
                className="text-[#C4704A] hover:text-[#A85D3B] font-medium"
              >
                View all tournaments →
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24 bg-[#2D4A3E]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-[#C4704A] font-medium tracking-wide uppercase text-sm mb-3">
                Free Newsletter
              </p>
              <h2 className="text-2xl md:text-3xl text-white mb-4">
                The Florida Pickleball Insider
              </h2>
              <p className="text-[#A8B5A8] mb-3 leading-relaxed">
                Join 1,000+ players getting the inside scoop every week.
              </p>
              <ul className="text-[#8A9B8A] text-sm mb-8 space-y-1">
                <li>Upcoming tournaments & registration deadlines</li>
                <li>Community spotlights & player stories</li>
                <li>Pro tips to level up your game</li>
              </ul>
              <NewsletterSignup />
              <p className="text-[#6B7B6B] text-xs mt-4">
                One email per week. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
