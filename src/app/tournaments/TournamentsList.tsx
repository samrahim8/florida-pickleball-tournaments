'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import TournamentCard from '@/components/TournamentCard'
import FilterDropdown from '@/components/FilterDropdown'
import { Tournament, FloridaRegion } from '@/types/database'
import { SKILL_LEVELS, FLORIDA_REGIONS } from '@/lib/constants'
import { createClient } from '@/lib/supabase'

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

export default function TournamentsList() {
  const searchParams = useSearchParams()
  const initialRegion = searchParams.get('region') as FloridaRegion | null
  const initialMonth = searchParams.get('month')

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<FloridaRegion | null>(initialRegion)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(initialMonth)

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'approved')
        .gte('date_end', new Date().toISOString().split('T')[0])
        .order('date_start', { ascending: true })

      if (selectedRegion) {
        query = query.eq('region', selectedRegion)
      }

      if (selectedLevel) {
        query = query.eq('level', selectedLevel)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tournaments:', error)
        setTournaments([])
      } else {
        let filtered = data || []

        // Filter by month if selected
        if (selectedMonth) {
          const monthNum = parseInt(selectedMonth)
          const currentYear = new Date().getFullYear()
          filtered = filtered.filter(t => {
            const startDate = new Date(t.date_start)
            const startMonth = startDate.getMonth() + 1
            const startYear = startDate.getFullYear()
            // Include tournaments from current year or next year for the selected month
            return startMonth === monthNum && (startYear === currentYear || startYear === currentYear + 1)
          })
        }

        setTournaments(filtered)
      }
      setLoading(false)
    }

    fetchTournaments()
  }, [selectedRegion, selectedLevel, selectedMonth])

  const regionOptions = [
    { value: null, label: 'All Regions' },
    ...FLORIDA_REGIONS.map(region => ({ value: region, label: region }))
  ]

  const levelOptions = [
    { value: null, label: 'All Levels' },
    ...SKILL_LEVELS.filter(l => l !== 'All Levels').map(level => ({ value: level, label: level }))
  ]

  const monthOptions = [
    { value: null, label: 'Any Month' },
    ...MONTHS.map(month => ({ value: month.value, label: month.label }))
  ]

  const hasActiveFilters = selectedRegion !== null || selectedLevel !== null || selectedMonth !== null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm text-[#9A948D] font-medium">Filters:</span>

        <FilterDropdown
          label="Region"
          options={regionOptions}
          selected={selectedRegion}
          onChange={(value) => setSelectedRegion(value as FloridaRegion | null)}
        />

        <FilterDropdown
          label="Skill Level"
          options={levelOptions}
          selected={selectedLevel}
          onChange={setSelectedLevel}
        />

        <FilterDropdown
          label="Month"
          options={monthOptions}
          selected={selectedMonth}
          onChange={setSelectedMonth}
        />

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedRegion(null)
              setSelectedLevel(null)
              setSelectedMonth(null)
            }}
            className="px-3 py-2 text-sm font-medium text-[#C4704A] hover:text-[#A85D3B] transition-colors"
          >
            Clear all
          </button>
        )}

        <div className="flex-grow" />

        <Link
          href="/calendar"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6B6560] hover:text-[#2C2C2C] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar View
        </Link>
      </div>

      {/* Results count */}
      <p className="text-[#6B6560] mb-6">
        {loading ? 'Loading...' : `${tournaments.length} tournament${tournaments.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Tournament Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#FFFDF9] border border-[#E8E2D9] rounded-lg p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-[#F5F0E8] rounded" />
                <div className="flex-grow space-y-3">
                  <div className="h-4 bg-[#F5F0E8] rounded w-1/3" />
                  <div className="h-5 bg-[#F5F0E8] rounded w-3/4" />
                  <div className="h-4 bg-[#F5F0E8] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFDF9] border border-[#E8E2D9] rounded-lg p-12 text-center">
          <p className="text-[#6B6560] text-lg mb-2">No tournaments found</p>
          <p className="text-[#9A948D] text-sm">
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      )}
    </div>
  )
}
