'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VenueMap from '@/components/VenueMap'
import { createClient } from '@/lib/supabase'
import { Tournament } from '@/types/database'

export default function TournamentDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTournament = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('tournaments')
        .select('*, organizer:organizers(*)')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single()

      if (data) {
        setTournament(data as Tournament)
      }
      setLoading(false)
    }

    loadTournament()
  }, [slug])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateRange = () => {
    if (!tournament) return ''
    const start = formatDate(tournament.date_start)
    if (tournament.date_end && tournament.date_end !== tournament.date_start) {
      const end = formatDate(tournament.date_end)
      return `${start} – ${end}`
    }
    return start
  }

  const getStatusBadge = () => {
    if (!tournament) return null
    const now = new Date()
    const start = new Date(tournament.date_start)
    const end = new Date(tournament.date_end || tournament.date_start)

    if (now < start) {
      return <span className="badge badge-green">Upcoming</span>
    }
    if (now >= start && now <= end) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#2D4A3E] text-white uppercase tracking-wide">Live Now</span>
    }
    return <span className="badge badge-gray">Completed</span>
  }

  const getGoogleMapsUrl = () => {
    if (!tournament) return ''
    if (tournament.lat && tournament.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${tournament.lat},${tournament.lng}`
    }
    if (tournament.venue_address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tournament.venue_address)}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tournament.city}, Florida`)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C4704A] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Header />
        <div className="max-w-4xl mx-auto py-20 px-4 text-center">
          <h1 className="font-serif text-3xl text-[#2C2C2C] mb-4">Tournament Not Found</h1>
          <p className="text-[#6B6560] mb-8">This tournament may have been removed or is not yet approved.</p>
          <Link href="/tournaments" className="btn-primary">
            Browse Tournaments
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      {/* Hero Section */}
      <div className="bg-[#2D4A3E]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/tournaments" className="inline-flex items-center gap-2 text-[#FAF7F2] hover:text-white text-sm mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tournaments
          </Link>

          <div className="flex items-start gap-3 mb-4">
            {tournament.featured && (
              <span className="badge badge-orange">Featured</span>
            )}
            {getStatusBadge()}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-white mb-4">
            {tournament.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDateRange()}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{tournament.venue_name || tournament.city}, {tournament.region}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {tournament.description && (
              <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
                <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">About This Tournament</h2>
                <p className="text-[#6B6560] whitespace-pre-wrap">{tournament.description}</p>
              </div>
            )}

            {/* Venue & Location */}
            <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
              <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Venue & Location</h2>

              <div className="space-y-3">
                {tournament.venue_name && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#C4704A] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="font-medium text-[#2C2C2C]">{tournament.venue_name}</p>
                      {tournament.venue_address && (
                        <p className="text-sm text-[#6B6560]">{tournament.venue_address}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#C4704A] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-[#2C2C2C]">{tournament.city}, {tournament.region}</p>
                    <p className="text-sm text-[#6B6560]">Florida</p>
                  </div>
                </div>

                {/* Embedded Map */}
                {tournament.lat && tournament.lng && (
                  <div className="mt-4">
                    <VenueMap
                      lat={tournament.lat}
                      lng={tournament.lng}
                      venueName={tournament.venue_name || undefined}
                    />
                  </div>
                )}

                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#F5F0E8] text-[#2C2C2C] rounded-lg hover:bg-[#E8E2D9] transition-colors"
                >
                  <svg className="w-5 h-5 text-[#C4704A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="font-medium">Get Directions</span>
                </a>
              </div>
            </div>

            {/* Tournament Image */}
            {tournament.image_url && (
              <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] overflow-hidden">
                <h2 className="font-serif text-lg text-[#2C2C2C] p-6 pb-4">Tournament Flyer</h2>
                <div className="px-6 pb-6">
                  <img
                    src={tournament.image_url}
                    alt={tournament.name}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
              <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Quick Info</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#9A948D] mb-1">Skill Level</p>
                  <p className="text-[#2C2C2C] font-medium">{tournament.level}</p>
                </div>

                {tournament.format && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9A948D] mb-1">Format</p>
                    <p className="text-[#2C2C2C] font-medium">{tournament.format}</p>
                  </div>
                )}

                {(tournament.entry_fee_min !== null || tournament.entry_fee_max !== null) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9A948D] mb-1">Entry Fee</p>
                    <p className="text-[#2C2C2C] font-medium">
                      ${tournament.entry_fee_min}
                      {tournament.entry_fee_max && tournament.entry_fee_max !== tournament.entry_fee_min && (
                        <> – ${tournament.entry_fee_max}</>
                      )}
                    </p>
                  </div>
                )}

                {tournament.max_participants && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9A948D] mb-1">Max Participants</p>
                    <p className="text-[#2C2C2C] font-medium">{tournament.max_participants}</p>
                  </div>
                )}

                {tournament.prize_pool && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9A948D] mb-1">Prize Pool</p>
                    <p className="text-[#2C2C2C] font-medium">{tournament.prize_pool}</p>
                  </div>
                )}

                {tournament.registration_deadline && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9A948D] mb-1">Registration Deadline</p>
                    <p className="text-[#2C2C2C] font-medium">
                      {new Date(tournament.registration_deadline).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            {tournament.categories && tournament.categories.length > 0 && (
              <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
                <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {tournament.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-[#F5F0E8] text-[#6B6560]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Register Button */}
            {tournament.registration_url && (
              <a
                href={tournament.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center block"
              >
                Register Now
              </a>
            )}

            {/* Organizer Info */}
            {tournament.organizer && (
              <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
                <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Organizer</h2>
                <div className="flex items-center gap-3">
                  {tournament.organizer.logo_url ? (
                    <Image
                      src={tournament.organizer.logo_url}
                      alt={tournament.organizer.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                      <span className="text-lg font-serif text-[#C4704A]">
                        {tournament.organizer.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[#2C2C2C]">{tournament.organizer.name}</p>
                    {tournament.organizer.verified && (
                      <div className="flex items-center gap-1 text-xs text-[#2D4A3E]">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Organizer
                      </div>
                    )}
                  </div>
                </div>
                {tournament.organizer.website && (
                  <a
                    href={tournament.organizer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-4 text-sm text-[#C4704A] hover:text-[#A35A3A] transition-colors"
                  >
                    Visit Website
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
