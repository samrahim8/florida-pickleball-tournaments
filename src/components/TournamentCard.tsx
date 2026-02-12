import Link from 'next/link'
import { Tournament } from '@/types/database'

interface TournamentCardProps {
  tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const startDate = new Date(tournament.date_start)
  const endDate = new Date(tournament.date_end)
  const isSameDay = tournament.date_start === tournament.date_end

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const dateDisplay = isSameDay
    ? formatDate(startDate)
    : `${formatDate(startDate)} - ${formatDate(endDate)}`

  const feeDisplay = tournament.entry_fee_min
    ? tournament.entry_fee_max && tournament.entry_fee_max !== tournament.entry_fee_min
      ? `$${tournament.entry_fee_min}-$${tournament.entry_fee_max}`
      : `$${tournament.entry_fee_min}`
    : null

  return (
    <Link href={`/tournaments/${tournament.slug}`}>
      <article className="card p-5 h-full flex flex-col cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Date */}
          <div className="flex-shrink-0 w-14 text-center">
            <div className="bg-orange-500 text-white rounded-lg py-2.5 px-2">
              <span className="block text-2xl font-bold leading-none">
                {startDate.getDate()}
              </span>
              <span className="block text-xs font-medium uppercase mt-0.5 opacity-90">
                {startDate.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge badge-teal">{tournament.region}</span>
              <span className="badge badge-gray">{tournament.level}</span>
            </div>

            <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
              {tournament.name}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {tournament.city}, FL
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">{dateDisplay}</span>
          {feeDisplay && (
            <span className="text-sm font-semibold text-orange-600">{feeDisplay}</span>
          )}
        </div>
      </article>
    </Link>
  )
}
