'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import FilterDropdown from '@/components/FilterDropdown'
import { createClient } from '@/lib/supabase'
import { Tournament } from '@/types/database'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [updating, setUpdating] = useState<string | null>(null)

  const checkAdminAndLoad = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/signin')
      return
    }

    // Check if user is admin
    const { data: organizer } = await supabase
      .from('organizers')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!organizer || !(organizer as any).is_admin) {
      router.push('/dashboard')
      return
    }

    await loadTournaments()
    setLoading(false)
  }

  const loadTournaments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tournaments')
      .select('*, organizer:organizers(name, email)')
      .order('created_at', { ascending: false })

    setAllTournaments((data as Tournament[]) || [])
  }

  // Initial load - check admin and load tournaments
  useEffect(() => {
    checkAdminAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter tournaments for display
  const tournaments = statusFilter === 'all'
    ? allTournaments
    : allTournaments.filter(t => t.status === statusFilter)

  const updateStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    setUpdating(id)
    const supabase = createClient()
    await supabase
      .from('tournaments')
      .update({ status })
      .eq('id', id)

    setTournaments(prev =>
      prev.map(t => t.id === id ? { ...t, status } : t)
    )
    setUpdating(null)
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    setUpdating(id)
    const supabase = createClient()
    await supabase
      .from('tournaments')
      .update({ featured })
      .eq('id', id)

    setTournaments(prev =>
      prev.map(t => t.id === id ? { ...t, featured } : t)
    )
    setUpdating(null)
  }

  const deleteTournament = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return

    setUpdating(id)
    const supabase = createClient()
    await supabase
      .from('tournaments')
      .delete()
      .eq('id', id)

    setTournaments(prev => prev.filter(t => t.id !== id))
    setUpdating(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const statusCounts = {
    all: allTournaments.length,
    pending: allTournaments.filter(t => t.status === 'pending').length,
    approved: allTournaments.filter(t => t.status === 'approved').length,
    rejected: allTournaments.filter(t => t.status === 'rejected').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C4704A] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-[#2C2C2C]">Admin Dashboard</h1>
            <p className="text-[#6B6560] mt-1">Manage tournament submissions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-4">
            <p className="text-2xl font-semibold text-[#2C2C2C]">{statusCounts.pending}</p>
            <p className="text-sm text-[#6B6560]">Pending Review</p>
          </div>
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-4">
            <p className="text-2xl font-semibold text-[#2D4A3E]">{statusCounts.approved}</p>
            <p className="text-sm text-[#6B6560]">Approved</p>
          </div>
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-4">
            <p className="text-2xl font-semibold text-red-600">{statusCounts.rejected}</p>
            <p className="text-sm text-[#6B6560]">Rejected</p>
          </div>
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-4">
            <p className="text-2xl font-semibold text-[#C4704A]">{allTournaments.filter(t => t.featured).length}</p>
            <p className="text-sm text-[#6B6560]">Featured</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-[#9A948D] font-medium">Filter:</span>
          <FilterDropdown
            label="Status"
            options={[
              { value: 'pending', label: `Pending (${statusCounts.pending})` },
              { value: 'approved', label: `Approved (${statusCounts.approved})` },
              { value: 'rejected', label: `Rejected (${statusCounts.rejected})` },
              { value: null, label: 'All Statuses' },
            ]}
            selected={statusFilter === 'all' ? null : statusFilter}
            onChange={(value) => setStatusFilter((value as StatusFilter) || 'all')}
          />
        </div>

        {/* Tournaments List */}
        <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] overflow-hidden">
          {tournaments.length === 0 ? (
            <div className="p-8 text-center text-[#6B6560]">
              No tournaments found
            </div>
          ) : (
            <div className="divide-y divide-[#E8E2D9]">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="p-4 hover:bg-[#F5F0E8]/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Tournament Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(tournament.status)}`}>
                          {tournament.status}
                        </span>
                        {tournament.featured && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#C4704A] text-white">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-[#2C2C2C] truncate">{tournament.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6B6560] mt-1">
                        <span>{tournament.city}, {tournament.region}</span>
                        <span>{formatDate(tournament.date_start)}</span>
                        {tournament.organizer && (
                          <span>by {tournament.organizer.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {tournament.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(tournament.id, 'approved')}
                            disabled={updating === tournament.id}
                            className="px-3 py-1.5 text-sm font-medium bg-[#2D4A3E] text-white rounded hover:bg-[#1e3329] transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(tournament.id, 'rejected')}
                            disabled={updating === tournament.id}
                            className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {tournament.status === 'approved' && (
                        <button
                          onClick={() => toggleFeatured(tournament.id, !tournament.featured)}
                          disabled={updating === tournament.id}
                          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors disabled:opacity-50 ${
                            tournament.featured
                              ? 'bg-[#C4704A] text-white hover:bg-[#a35d3d]'
                              : 'bg-[#F5F0E8] text-[#6B6560] hover:bg-[#E8E2D9]'
                          }`}
                        >
                          {tournament.featured ? 'Unfeature' : 'Feature'}
                        </button>
                      )}

                      {tournament.status === 'rejected' && (
                        <button
                          onClick={() => updateStatus(tournament.id, 'approved')}
                          disabled={updating === tournament.id}
                          className="px-3 py-1.5 text-sm font-medium bg-[#2D4A3E] text-white rounded hover:bg-[#1e3329] transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}

                      <Link
                        href={`/admin/edit/${tournament.id}`}
                        className="px-3 py-1.5 text-sm font-medium bg-[#F5F0E8] text-[#6B6560] rounded hover:bg-[#E8E2D9] transition-colors"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteTournament(tournament.id, tournament.name)}
                        disabled={updating === tournament.id}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
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
