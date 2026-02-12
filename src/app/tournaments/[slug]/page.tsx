import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase-server'
import { Tournament } from '@/types/database'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getTournament(slug: string): Promise<Tournament | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tournaments')
    .select('*, venue:venues(*), organizer:organizers(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as Tournament
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const tournament = await getTournament(slug)

  if (!tournament) {
    return { title: 'Tournament Not Found' }
  }

  return {
    title: `${tournament.name} | Florida Pickleball Tournaments`,
    description: tournament.description || `${tournament.name} in ${tournament.city}, FL. ${tournament.level} level pickleball tournament.`,
  }
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const tournament = await getTournament(slug)

  if (!tournament) {
    notFound()
  }

  const startDate = new Date(tournament.date_start)
  const endDate = new Date(tournament.date_end)
  const isSameDay = tournament.date_start === tournament.date_end

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const dateDisplay = isSameDay
    ? formatDate(startDate)
    : `${formatDate(startDate)} - ${formatDate(endDate)}`

  const registrationDeadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const feeDisplay = tournament.entry_fee_min
    ? tournament.entry_fee_max && tournament.entry_fee_max !== tournament.entry_fee_min
      ? `$${tournament.entry_fee_min} - $${tournament.entry_fee_max}`
      : `$${tournament.entry_fee_min}`
    : 'TBD'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-cream-dark py-3">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm">
            <Link href="/tournaments" className="text-charcoal-light hover:text-court-green">
              Tournaments
            </Link>
            <span className="mx-2 text-charcoal-light">/</span>
            <span className="text-charcoal">{tournament.name}</span>
          </nav>
        </div>
      </div>

      <main className="flex-grow">
        <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="region-badge">{tournament.region}</span>
              <span className="skill-badge">{tournament.level}</span>
              {tournament.featured && (
                <span className="px-3 py-1 text-xs font-medium bg-brass/20 text-brass border border-brass/30">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight mb-4">
              {tournament.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-charcoal-light">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tournament.city}, FL
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateDisplay}
              </span>
            </div>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              {tournament.description && (
                <section>
                  <h2 className="font-serif text-xl text-charcoal mb-4">About</h2>
                  <div className="prose prose-charcoal">
                    <p className="text-charcoal-light leading-relaxed whitespace-pre-wrap">
                      {tournament.description}
                    </p>
                  </div>
                </section>
              )}

              {/* Categories */}
              {tournament.categories && tournament.categories.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl text-charcoal mb-4">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {tournament.categories.map((category) => (
                      <span key={category} className="skill-badge">
                        {category}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Venue */}
              {tournament.venue && (
                <section>
                  <h2 className="font-serif text-xl text-charcoal mb-4">Venue</h2>
                  <div className="card-texture p-5">
                    <h3 className="font-medium text-charcoal mb-2">{tournament.venue.name}</h3>
                    {tournament.venue.address && (
                      <p className="text-charcoal-light text-sm mb-3">
                        {tournament.venue.address}, {tournament.venue.city}, FL
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-charcoal-light">
                      {tournament.venue.court_count && (
                        <span>{tournament.venue.court_count} courts</span>
                      )}
                      {tournament.venue.indoor && <span>Indoor</span>}
                      {tournament.venue.outdoor && <span>Outdoor</span>}
                      {tournament.venue.surface_type && (
                        <span>{tournament.venue.surface_type}</span>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Organizer */}
              {tournament.organizer && (
                <section>
                  <h2 className="font-serif text-xl text-charcoal mb-4">Organizer</h2>
                  <div className="card-texture p-5">
                    <div className="flex items-center gap-3">
                      {tournament.organizer.logo_url ? (
                        <img
                          src={tournament.organizer.logo_url}
                          alt={tournament.organizer.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-court-green/10 flex items-center justify-center">
                          <span className="text-court-green font-serif text-xl">
                            {tournament.organizer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-charcoal">
                          {tournament.organizer.name}
                          {tournament.organizer.verified && (
                            <span className="ml-2 text-court-green text-sm">Verified</span>
                          )}
                        </h3>
                        {tournament.organizer.website && (
                          <a
                            href={tournament.organizer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-court-green hover:text-court-green-light"
                          >
                            Visit website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Registration Card */}
              <div className="card-texture p-6 sticky top-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal-light text-sm">Entry Fee</span>
                    <span className="text-xl font-medium text-terracotta">{feeDisplay}</span>
                  </div>

                  {tournament.format && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-light text-sm">Format</span>
                      <span className="text-charcoal">{tournament.format}</span>
                    </div>
                  )}

                  {tournament.max_participants && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-light text-sm">Max Participants</span>
                      <span className="text-charcoal">{tournament.max_participants}</span>
                    </div>
                  )}

                  {registrationDeadline && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-light text-sm">Deadline</span>
                      <span className="text-charcoal">{registrationDeadline}</span>
                    </div>
                  )}

                  {tournament.prize_pool && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-light text-sm">Prize Pool</span>
                      <span className="text-brass font-medium">{tournament.prize_pool}</span>
                    </div>
                  )}

                  <hr className="border-cream-dark" />

                  {tournament.registration_url ? (
                    <a
                      href={tournament.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary block text-center w-full"
                    >
                      Register Now
                    </a>
                  ) : (
                    <p className="text-center text-charcoal-light text-sm">
                      Registration info coming soon
                    </p>
                  )}
                </div>
              </div>

              {/* Results */}
              {(tournament.results_url || tournament.results_summary) && (
                <div className="card-texture p-6">
                  <h3 className="font-serif text-lg text-charcoal mb-4">Results</h3>
                  {tournament.results_summary && (
                    <p className="text-charcoal-light text-sm mb-4">
                      {tournament.results_summary}
                    </p>
                  )}
                  {tournament.results_url && (
                    <a
                      href={tournament.results_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-court-green hover:text-court-green-light text-sm font-medium"
                    >
                      View full results &rarr;
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
