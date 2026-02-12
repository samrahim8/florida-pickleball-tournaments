import Link from 'next/link'
import { Tournament } from '@/types/database'

interface TournamentCardProps {
  tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateRange = () => {
    const start = formatDate(tournament.date_start)
    if (tournament.date_end && tournament.date_end !== tournament.date_start) {
      const end = formatDate(tournament.date_end)
      return `${start} – ${end}`
    }
    return start
  }

  const getStatusBadge = () => {
    const now = new Date()
    const start = new Date(tournament.date_start)
    const end = new Date(tournament.date_end || tournament.date_start)

    if (now < start) {
      return <span className="badge badge-green">Upcoming</span>
    }
    if (now >= start && now <= end) {
      return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#2D4A3E] text-white uppercase tracking-wide">Live</span>
    }
    return <span className="badge badge-gray">Ended</span>
  }

  return (
    <Link href={`/tournaments/${tournament.slug}`} className="card group p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {tournament.featured && (
              <span className="badge badge-orange">Featured</span>
            )}
            {getStatusBadge()}
          </div>
          <h3 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#C4704A] transition-colors truncate">
            {tournament.name}
          </h3>
        </div>
      </div>

      <div className="space-y-2.5 text-sm text-[#6B6560]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDateRange()}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex flex-col">
            {tournament.venue_name && (
              <span className="font-medium text-[#2C2C2C]">{tournament.venue_name}</span>
            )}
            <span>{tournament.city}, {tournament.region}</span>
          </div>
        </div>

        {tournament.lat && tournament.lng && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${tournament.lat},${tournament.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[#C4704A] hover:text-[#A35A3A] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-xs font-medium">Get Directions</span>
          </a>
        )}

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{tournament.level}</span>
        </div>

        {tournament.entry_fee_min !== null && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              ${tournament.entry_fee_min}
              {tournament.entry_fee_max && tournament.entry_fee_max !== tournament.entry_fee_min && (
                <> – ${tournament.entry_fee_max}</>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Categories */}
      {tournament.categories && tournament.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[#E8E2D9]">
          {tournament.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#F5F0E8] text-[#6B6560] uppercase tracking-wide"
            >
              {cat}
            </span>
          ))}
          {tournament.categories.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] font-medium text-[#9A948D]">
              +{tournament.categories.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
