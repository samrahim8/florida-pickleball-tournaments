'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TournamentCard from '@/components/TournamentCard'
import RegionFilter from '@/components/RegionFilter'
import { Tournament, FloridaRegion } from '@/types/database'
import { SKILL_LEVELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase'

export default function TournamentsList() {
  const searchParams = useSearchParams()
  const initialRegion = searchParams.get('region') as FloridaRegion | null

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<FloridaRegion | null>(initialRegion)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('tournaments')
        .select('*')
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
        setTournaments(data || [])
      }
      setLoading(false)
    }

    fetchTournaments()
  }, [selectedRegion, selectedLevel])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <RegionFilter selected={selectedRegion} onChange={setSelectedRegion} />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLevel(null)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              selectedLevel === null
                ? 'bg-[#C4704A] text-white'
                : 'bg-[#FFFDF9] text-[#2C2C2C] hover:bg-[#C4704A]/10'
            }`}
          >
            All Levels
          </button>
          {SKILL_LEVELS.filter(l => l !== 'All Levels').map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                selectedLevel === level
                  ? 'bg-[#C4704A] text-white'
                  : 'bg-[#FFFDF9] text-[#2C2C2C] hover:bg-[#C4704A]/10'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
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
