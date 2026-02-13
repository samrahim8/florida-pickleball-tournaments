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

      {/* Simple Nav Bar */}
      <div className="border-b border-[#E8E2D9] bg-[#FFFDF9]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-[#6B6560] hover:text-[#2C2C2C] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            {tournament.registration_url && (
              <a
                href={tournament.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium bg-[#C4704A] rounded-lg hover:bg-[#A85D3B] transition-colors"
                style={{ color: 'white' }}
              >
                Register Now
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Top Row - Event Details + Location (same height) */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Event Details Card - Most important info */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-lg shadow-[#2C2C2C]/5 p-7 h-full flex flex-col relative overflow-hidden">
              {/* Subtle accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4704A] via-[#D4845A] to-[#C4704A]" />

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="font-serif text-2xl text-[#2C2C2C] leading-tight">{tournament.name}</h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tournament.featured && (
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-[#C4704A] to-[#D4845A] text-white uppercase tracking-wider shadow-sm">Featured</span>
                  )}
                  {getStatusBadge()}
                </div>
              </div>

              {/* Date - Premium treatment */}
              <div className="bg-gradient-to-br from-[#2D4A3E] to-[#1e3329] rounded-lg p-5 mb-6 text-white">
                <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Tournament Date</p>
                <p className="font-semibold text-lg">{formatDateRange()}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 flex-grow">
                {/* Entry Fee */}
                {(tournament.entry_fee_min !== null || tournament.entry_fee_max !== null) && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9A948D] mb-1 font-medium">Entry Fee</p>
                    <p className="text-[#2C2C2C] font-semibold text-lg">
                      ${tournament.entry_fee_min}
                      {tournament.entry_fee_max && tournament.entry_fee_max !== tournament.entry_fee_min && (
                        <span className="text-base font-normal text-[#6B6560]"> – ${tournament.entry_fee_max}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Skill Level */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#9A948D] mb-1 font-medium">Skill Level</p>
                  <p className="text-[#2C2C2C] font-semibold text-lg">{tournament.level}</p>
                </div>

                {/* Registration Deadline */}
                {tournament.registration_deadline && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9A948D] mb-1 font-medium">Reg. Deadline</p>
                    <p className="text-[#C4704A] font-bold text-lg">
                      {new Date(tournament.registration_deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {/* Format */}
                {tournament.format && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9A948D] mb-1 font-medium">Format</p>
                    <p className="text-[#2C2C2C] font-semibold">{tournament.format}</p>
                  </div>
                )}

                {/* Category */}
                {tournament.categories && tournament.categories.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9A948D] mb-1 font-medium">Category</p>
                    <p className="text-[#2C2C2C] font-semibold">{tournament.categories.join(', ')}</p>
                  </div>
                )}

                {/* Max Participants */}
                {tournament.max_participants && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9A948D] mb-1 font-medium">Max Players</p>
                    <p className="text-[#2C2C2C] font-semibold">{tournament.max_participants}</p>
                  </div>
                )}

                {/* Prize Pool */}
                {tournament.prize_pool && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#9A948D] mb-1 font-medium">Prize Pool</p>
                    <p className="text-[#2D4A3E] font-bold text-lg">{tournament.prize_pool}</p>
                  </div>
                )}
              </div>

              {/* Register Button - Premium styling */}
              {tournament.registration_url && (
                <a
                  href={tournament.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block mt-6 px-6 py-4 text-sm font-bold bg-gradient-to-r from-[#C4704A] to-[#B8633F] rounded-lg hover:from-[#B8633F] hover:to-[#A85D3B] transition-all shadow-md hover:shadow-lg"
                  style={{ color: 'white' }}
                >
                  Register Now →
                </a>
              )}
            </div>
          </div>

          {/* Location Card - Stretches to match Event Details */}
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6 h-full flex flex-col">
            <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Location</h2>

            <div className="space-y-1 mb-4">
              {tournament.venue_name && (
                <p className="font-medium text-[#2C2C2C]">{tournament.venue_name}</p>
              )}
              <p className="text-sm text-[#6B6560]">
                {tournament.venue_address || `${tournament.city}, ${tournament.region}`}
              </p>
            </div>

            {/* Embedded Map - grows to fill space */}
            {tournament.lat && tournament.lng && (
              <div className="flex-grow rounded-lg overflow-hidden mb-4 min-h-[200px]">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F0E8] text-[#2C2C2C] rounded-lg hover:bg-[#E8E2D9] transition-colors text-sm mt-auto"
            >
              <svg className="w-4 h-4 text-[#C4704A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-medium">Get Directions</span>
            </a>
          </div>
        </div>

        {/* Additional Content Below */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {tournament.description && (
              <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
                <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">About This Tournament</h2>
                <p className="text-[#6B6560] whitespace-pre-wrap">{tournament.description}</p>
              </div>
            )}

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

          {/* Organizer in sidebar position */}
          <div>
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
