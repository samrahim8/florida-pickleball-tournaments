import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TournamentCard from '@/components/TournamentCard'
import NewsletterSignup from '@/components/NewsletterSignup'
import { createClient } from '@/lib/supabase-server'
import { Tournament } from '@/types/database'
import { FLORIDA_REGIONS } from '@/lib/constants'

async function getFeaturedTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('featured', true)
    .gte('date_end', new Date().toISOString().split('T')[0])
    .order('date_start', { ascending: true })
    .limit(3)

  if (error) {
    console.error('Error fetching featured tournaments:', error)
    return []
  }
  return (data || []) as Tournament[]
}

async function getUpcomingTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .gte('date_end', new Date().toISOString().split('T')[0])
    .order('date_start', { ascending: true })
    .limit(6)

  if (error) {
    console.error('Error fetching upcoming tournaments:', error)
    return []
  }
  return (data || []) as Tournament[]
}

export default async function Home() {
  const [featured, upcoming] = await Promise.all([
    getFeaturedTournaments(),
    getUpcomingTournaments(),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Find pickleball tournaments in{' '}
              <span className="text-orange-500">Florida</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-2xl">
              The complete guide to tournaments across the Sunshine State.
              From South Florida to the Panhandle.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/tournaments" className="btn-primary">
                Browse Tournaments
              </Link>
              <Link href="/submit" className="btn-secondary">
                Submit a Tournament
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Region Quick Links */}
      <section className="py-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Regions:</span>
            {FLORIDA_REGIONS.map((region) => (
              <Link
                key={region}
                href={`/tournaments?region=${encodeURIComponent(region)}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                {region}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-grow">
        {/* Featured Tournaments */}
        {featured.length > 0 && (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                <span className="badge badge-orange">Featured</span>
                <h2 className="text-2xl font-bold text-gray-900">
                  Don&apos;t miss these
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Tournaments */}
        <section className={`py-16 ${featured.length > 0 ? 'bg-gray-50' : ''}`}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Upcoming Tournaments
                </h2>
                <p className="text-gray-500 mt-1">
                  {upcoming.length} tournaments on the calendar
                </p>
              </div>
              <Link
                href="/tournaments"
                className="hidden sm:inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {upcoming.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {upcoming.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  No upcoming tournaments at the moment.
                </p>
                <Link href="/submit" className="btn-primary">
                  Submit a Tournament
                </Link>
              </div>
            )}

            <div className="sm:hidden mt-8 text-center">
              <Link
                href="/tournaments"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                View all tournaments →
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Stay in the loop
              </h2>
              <p className="text-gray-400 mb-8">
                Get notified when new tournaments are added in your region. No spam.
              </p>
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
