'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase'
import { Tournament } from '@/types/database'

interface Organizer {
  id: string
  name: string
  email: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    const loadDashboard = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/signin')
        return
      }

      // Get organizer profile
      const { data: org } = await supabase
        .from('organizers')
        .select('id, name, email')
        .eq('user_id', user.id)
        .single()

      if (!org) {
        router.push('/onboarding')
        return
      }

      setOrganizer(org as Organizer)

      // Get tournaments
      const { data: tourns } = await supabase
        .from('tournaments')
        .select('*')
        .eq('organizer_id', (org as any).id)
        .order('created_at', { ascending: false })

      setTournaments((tourns || []) as Tournament[])
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  const getStatusBadge = (tournament: Tournament) => {
    const now = new Date()
    const start = new Date(tournament.date_start)
    const end = new Date(tournament.date_end)
    const status = tournament.status

    if (status === 'pending') {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Pending Review</span>
    }
    if (status === 'rejected') {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Rejected</span>
    }
    if (status === 'cancelled') {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Cancelled</span>
    }
    // For approved/active tournaments, show date-based status
    if (now < start) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Upcoming</span>
    }
    if (now >= start && now <= end) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Live</span>
    }
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Ended</span>
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const pendingCount = tournaments.filter(t => t.status === 'pending').length
  const approvedCount = tournaments.filter(t => t.status === 'approved').length
  const upcomingCount = tournaments.filter(t => {
    const now = new Date()
    const start = new Date(t.date_start)
    return t.status === 'approved' && now < start
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {organizer?.name?.split(' ')[0] || 'Organizer'}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your tournaments and submissions
            </p>
          </div>
          <Link href="/submit" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Tournament
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-gray-900">{tournaments.length}</div>
            <div className="text-sm text-gray-500 mt-1">Total Tournaments</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-gray-500 mt-1">Approved</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-500 mt-1">Pending Review</div>
          </div>
        </div>

        {/* Tournaments List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Your Tournaments</h2>
          </div>

          {tournaments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">No tournaments yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Submit your first tournament to get started
              </p>
              <Link href="/submit" className="btn-primary">
                Submit Tournament
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {tournament.name}
                        </h3>
                        {getStatusBadge(tournament)}
                        {tournament.featured && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">Featured</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(tournament.date_start)}
                          {tournament.date_end !== tournament.date_start && (
                            <> - {formatDate(tournament.date_end)}</>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {tournament.city}, {tournament.region}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tournament.status === 'approved' && (
                        <Link
                          href={`/tournaments/${tournament.slug}`}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/tournaments/${tournament.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
