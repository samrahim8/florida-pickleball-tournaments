'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MultiFilterDropdown } from '@/components/FilterDropdown'
import { createClient } from '@/lib/supabase'
import { Tournament, FloridaRegion } from '@/types/database'
import { FLORIDA_REGIONS } from '@/lib/constants'

type ViewMode = 'month' | 'list'

const REGION_COLORS: Record<FloridaRegion, { bg: string; text: string; border: string }> = {
  'South Florida': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'Central Florida': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  'Tampa Bay': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'North Florida': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  'Panhandle': { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [hoveredTournament, setHoveredTournament] = useState<Tournament | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [selectedRegions, setSelectedRegions] = useState<FloridaRegion[]>([])
  const calendarRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    loadTournaments()
  }, [year, month])

  const loadTournaments = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get tournaments for current month view (with buffer for multi-day events)
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month + 2, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'approved')
      .gte('date_end', startDate)
      .lte('date_start', endDate)
      .order('date_start', { ascending: true })

    setTournaments((data || []) as Tournament[])

    // Also load all upcoming for list view
    const { data: allData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'approved')
      .gte('date_end', new Date().toISOString().split('T')[0])
      .order('date_start', { ascending: true })

    setAllTournaments((allData || []) as Tournament[])
    setLoading(false)
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSameDay = (date1: Date, date2: Date | null) => {
    if (!date2) return false
    return date1.toDateString() === date2.toDateString()
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getRegionColor = (region: FloridaRegion) => {
    return REGION_COLORS[region] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
  }

  const toggleRegionFilter = (region: FloridaRegion) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    )
  }

  const filteredTournaments = selectedRegions.length > 0
    ? tournaments.filter(t => selectedRegions.includes(t.region))
    : tournaments

  const filteredAllTournaments = selectedRegions.length > 0
    ? allTournaments.filter(t => selectedRegions.includes(t.region))
    : allTournaments

  // Get tournaments that span into a specific week row
  const getTournamentsForWeek = (weekStart: Date, weekEnd: Date) => {
    return filteredTournaments.filter(t => {
      const tStart = new Date(t.date_start)
      const tEnd = new Date(t.date_end || t.date_start)
      // Tournament overlaps with this week
      return tStart <= weekEnd && tEnd >= weekStart
    })
  }

  // Calculate tournament bar positioning within a week
  const getTournamentBars = (weekStart: Date, weekDates: Date[]) => {
    const weekEnd = weekDates[weekDates.length - 1]
    const weekTournaments = getTournamentsForWeek(weekStart, weekEnd)

    const bars: { tournament: Tournament; startCol: number; span: number; row: number }[] = []
    const rowOccupancy: number[][] = [] // Track which columns are occupied in each row

    weekTournaments.forEach(tournament => {
      const tStart = new Date(tournament.date_start)
      const tEnd = new Date(tournament.date_end || tournament.date_start)

      // Find start column (0-6)
      let startCol = 0
      for (let i = 0; i < weekDates.length; i++) {
        if (weekDates[i] >= tStart) {
          startCol = i
          break
        }
        if (i === weekDates.length - 1) startCol = 0
      }
      if (tStart < weekStart) startCol = 0

      // Find end column
      let endCol = 6
      for (let i = weekDates.length - 1; i >= 0; i--) {
        if (weekDates[i] <= tEnd) {
          endCol = i
          break
        }
      }
      if (tEnd > weekEnd) endCol = 6

      const span = endCol - startCol + 1

      // Find first available row
      let row = 0
      while (true) {
        if (!rowOccupancy[row]) rowOccupancy[row] = []
        const isOccupied = rowOccupancy[row].some(col => col >= startCol && col <= endCol)
        if (!isOccupied) {
          // Mark columns as occupied
          for (let c = startCol; c <= endCol; c++) {
            rowOccupancy[row].push(c)
          }
          break
        }
        row++
        if (row > 5) break // Max 6 rows of tournaments per week
      }

      bars.push({ tournament, startCol, span, row })
    })

    return bars.sort((a, b) => a.row - b.row)
  }

  const handleTournamentHover = (tournament: Tournament, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoverPosition({ x: rect.left, y: rect.bottom + 8 })
    setHoveredTournament(tournament)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  // Build weeks array
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Add empty days before first of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    const prevMonthDay = new Date(year, month, 0 - (firstDayOfMonth - 1 - i))
    currentWeek.push(prevMonthDay)
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day))
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // Add remaining days from next month
  if (currentWeek.length > 0) {
    let nextDay = 1
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, nextDay++))
    }
    weeks.push(currentWeek)
  }

  // Get tournaments for selected date
  const selectedDateTournaments = selectedDate
    ? filteredTournaments.filter(t => {
        const dateStr = selectedDate.toISOString().split('T')[0]
        return dateStr >= t.date_start && dateStr <= (t.date_end || t.date_start)
      })
    : []

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (start === end) return startStr
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl text-[#2C2C2C]">Tournament Calendar</h1>
                <p className="text-[#6B6560] mt-1">
                  {filteredAllTournaments.length} upcoming tournaments
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-1 flex">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'month'
                        ? 'bg-[#2D4A3E] text-white'
                        : 'text-[#6B6560] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <span className="hidden sm:inline">Month</span>
                    <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#2D4A3E] text-white'
                        : 'text-[#6B6560] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <span className="hidden sm:inline">List</span>
                    <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <Link href="/tournaments" className="btn-secondary text-sm hidden sm:inline-flex">
                  Browse All
                </Link>
              </div>
            </div>

            {/* Region Filter Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#9A948D] font-medium">Filters:</span>
              <MultiFilterDropdown
                label="Region"
                options={FLORIDA_REGIONS.map(region => ({ value: region, label: region }))}
                selected={selectedRegions}
                onChange={(values) => setSelectedRegions(values as FloridaRegion[])}
              />
              {selectedRegions.length > 0 && (
                <button
                  onClick={() => setSelectedRegions([])}
                  className="px-3 py-2 text-sm font-medium text-[#C4704A] hover:text-[#A85D3B] transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {viewMode === 'month' ? (
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-3" ref={calendarRef}>
                <div className="bg-[#FFFDF9] rounded-xl border border-[#E8E2D9] overflow-hidden">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-[#E8E2D9]">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
                      aria-label="Previous month"
                    >
                      <svg className="w-5 h-5 text-[#6B6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-medium text-[#2C2C2C]">
                        {formatMonthYear(currentDate)}
                      </h2>
                      <button
                        onClick={goToToday}
                        className="px-3 py-1 text-sm font-medium text-[#C4704A] hover:bg-[#F5F0E8] rounded-lg transition-colors"
                      >
                        Today
                      </button>
                    </div>

                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-[#F5F0E8] rounded-lg transition-colors"
                      aria-label="Next month"
                    >
                      <svg className="w-5 h-5 text-[#6B6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Day Labels */}
                  <div className="grid grid-cols-7 border-b border-[#E8E2D9] bg-[#F5F0E8]/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="py-3 text-center text-xs font-semibold text-[#9A948D] uppercase tracking-wide">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid with Spanning Bars */}
                  <div className="divide-y divide-[#E8E2D9]">
                    {weeks.map((week, weekIndex) => {
                      const bars = getTournamentBars(week[0], week)
                      const maxRows = Math.max(1, ...bars.map(b => b.row + 1))

                      return (
                        <div key={weekIndex} className="relative">
                          {/* Day cells */}
                          <div className="grid grid-cols-7">
                            {week.map((date, dayIndex) => {
                              const isCurrentMonth = date.getMonth() === month
                              const isCurrentDay = isToday(date)
                              const isSelected = isSameDay(date, selectedDate)

                              return (
                                <button
                                  key={dayIndex}
                                  onClick={() => setSelectedDate(date)}
                                  className={`min-h-[110px] sm:min-h-[130px] p-2 border-r border-[#E8E2D9] last:border-r-0 text-left transition-colors flex flex-col ${
                                    isSelected
                                      ? 'bg-[#2D4A3E]/5'
                                      : isCurrentMonth
                                      ? 'hover:bg-[#F5F0E8]/50'
                                      : 'bg-[#F5F0E8]/30 hover:bg-[#F5F0E8]/50'
                                  }`}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full mb-1 ${
                                      isCurrentDay
                                        ? 'bg-[#C4704A] text-white shadow-sm'
                                        : isSelected
                                        ? 'bg-[#2D4A3E] text-white'
                                        : isCurrentMonth
                                        ? 'text-[#2C2C2C]'
                                        : 'text-[#9A948D]'
                                    }`}
                                  >
                                    {date.getDate()}
                                  </span>
                                </button>
                              )
                            })}
                          </div>

                          {/* Tournament bars overlay - positioned below dates */}
                          <div
                            className="absolute left-0 right-0 pointer-events-none px-1"
                            style={{ top: '44px' }}
                          >
                            {bars.slice(0, 3).map(({ tournament, startCol, span, row }) => {
                              const colors = getRegionColor(tournament.region)

                              return (
                                <Link
                                  key={`${tournament.id}-${weekIndex}`}
                                  href={`/tournaments/${tournament.slug}`}
                                  className={`absolute h-[22px] rounded-md px-2 flex items-center pointer-events-auto transition-all hover:shadow-md hover:scale-[1.02] ${
                                    tournament.featured
                                      ? 'bg-gradient-to-r from-[#C4704A] to-[#D4845A] text-white shadow-sm'
                                      : `${colors.bg} ${colors.text} border ${colors.border}`
                                  }`}
                                  style={{
                                    left: `calc(${(startCol / 7) * 100}% + 2px)`,
                                    width: `calc(${(span / 7) * 100}% - 4px)`,
                                    top: `${row * 26}px`,
                                  }}
                                  onMouseEnter={(e) => handleTournamentHover(tournament, e)}
                                  onMouseLeave={() => setHoveredTournament(null)}
                                >
                                  <span className="text-[11px] font-semibold truncate">
                                    {tournament.name}
                                  </span>
                                </Link>
                              )
                            })}
                            {bars.length > 3 && (
                              <div
                                className="absolute text-[11px] text-[#C4704A] font-medium px-2 cursor-pointer hover:underline"
                                style={{ top: `${3 * 26}px`, left: '4px' }}
                              >
                                +{bars.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[#6B6560]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#C4704A]" />
                    <span>Featured</span>
                  </div>
                  {(Object.keys(REGION_COLORS) as FloridaRegion[]).map(region => {
                    const colors = getRegionColor(region)
                    return (
                      <div key={region} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${colors.bg}`} />
                        <span className="hidden sm:inline">{region}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Date Panel */}
              <div className="lg:col-span-1">
                <div className="bg-[#FFFDF9] rounded-xl border border-[#E8E2D9] p-5 sticky top-24">
                  {selectedDate ? (
                    <>
                      <h3 className="text-lg font-medium text-[#2C2C2C] mb-1">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>

                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-[#C4704A] border-t-transparent rounded-full" />
                        </div>
                      ) : selectedDateTournaments.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {selectedDateTournaments.map((tournament) => {
                            const colors = getRegionColor(tournament.region)
                            return (
                              <Link
                                key={tournament.id}
                                href={`/tournaments/${tournament.slug}`}
                                className="block p-4 rounded-lg border border-[#E8E2D9] hover:border-[#C4704A]/30 hover:bg-[#F5F0E8]/50 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  {tournament.featured && (
                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#C4704A] text-white uppercase">
                                      Featured
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${colors.bg} ${colors.text} uppercase`}>
                                    {tournament.region}
                                  </span>
                                </div>
                                <h4 className="font-medium text-[#2C2C2C] mb-1">
                                  {tournament.name}
                                </h4>
                                <p className="text-sm text-[#6B6560]">
                                  {tournament.venue_name || tournament.city}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-[#9A948D]">
                                  <span>{formatDateRange(tournament.date_start, tournament.date_end)}</span>
                                  {tournament.entry_fee_min && (
                                    <span>${tournament.entry_fee_min}+</span>
                                  )}
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="mt-4 text-center py-8">
                          <div className="w-12 h-12 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-[#6B6560]">No tournaments on this day</p>
                          <Link href="/submit" className="text-[#C4704A] text-sm font-medium mt-2 inline-block hover:underline">
                            Submit a tournament
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <p className="text-[#6B6560]">Select a date to see tournaments</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="bg-[#FFFDF9] rounded-xl border border-[#E8E2D9] overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin w-8 h-8 border-2 border-[#C4704A] border-t-transparent rounded-full" />
                </div>
              ) : filteredAllTournaments.length > 0 ? (
                <div className="divide-y divide-[#E8E2D9]">
                  {filteredAllTournaments.map((tournament) => {
                    const colors = getRegionColor(tournament.region)
                    const startDate = new Date(tournament.date_start)
                    const isThisMonth = startDate.getMonth() === new Date().getMonth() && startDate.getFullYear() === new Date().getFullYear()

                    return (
                      <Link
                        key={tournament.id}
                        href={`/tournaments/${tournament.slug}`}
                        className="flex items-start gap-4 p-4 sm:p-6 hover:bg-[#F5F0E8]/50 transition-colors"
                      >
                        {/* Date Badge */}
                        <div className={`flex-shrink-0 w-16 text-center p-2 rounded-lg ${isThisMonth ? 'bg-[#C4704A]/10' : 'bg-[#F5F0E8]'}`}>
                          <div className={`text-xs font-semibold uppercase ${isThisMonth ? 'text-[#C4704A]' : 'text-[#9A948D]'}`}>
                            {startDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className={`text-2xl font-bold ${isThisMonth ? 'text-[#C4704A]' : 'text-[#6B6560]'}`}>
                            {startDate.getDate()}
                          </div>
                        </div>

                        {/* Tournament Info */}
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {tournament.featured && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#C4704A] text-white uppercase">
                                Featured
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${colors.bg} ${colors.text} uppercase`}>
                              {tournament.region}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#F5F0E8] text-[#6B6560] uppercase">
                              {tournament.level}
                            </span>
                          </div>
                          <h3 className="font-medium text-[#2C2C2C] text-lg mb-1 truncate">
                            {tournament.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B6560]">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {tournament.venue_name ? `${tournament.venue_name}, ${tournament.city}` : tournament.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDateRange(tournament.date_start, tournament.date_end)}
                            </span>
                            {tournament.entry_fee_min && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ${tournament.entry_fee_min}{tournament.entry_fee_max && tournament.entry_fee_max !== tournament.entry_fee_min ? ` - $${tournament.entry_fee_max}` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 hidden sm:block">
                          <svg className="w-5 h-5 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl text-[#2C2C2C] mb-2">No Upcoming Tournaments</h3>
                  <p className="text-[#6B6560] mb-6">
                    {selectedRegions.length > 0
                      ? 'No tournaments found for the selected regions.'
                      : 'Be the first to list a tournament!'}
                  </p>
                  <Link href="/submit" className="btn-primary">
                    Submit a Tournament
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Hover Preview Tooltip */}
          {hoveredTournament && (
            <div
              className="fixed z-50 bg-white rounded-lg shadow-xl border border-[#E8E2D9] p-4 w-72 pointer-events-none"
              style={{
                left: Math.min(hoverPosition.x, window.innerWidth - 300),
                top: hoverPosition.y,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {hoveredTournament.featured && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#C4704A] text-white uppercase">
                    Featured
                  </span>
                )}
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${getRegionColor(hoveredTournament.region).bg} ${getRegionColor(hoveredTournament.region).text} uppercase`}>
                  {hoveredTournament.region}
                </span>
              </div>
              <h4 className="font-medium text-[#2C2C2C] mb-1">{hoveredTournament.name}</h4>
              <p className="text-sm text-[#6B6560] mb-2">
                {hoveredTournament.venue_name || hoveredTournament.city}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#9A948D]">
                <span>{formatDateRange(hoveredTournament.date_start, hoveredTournament.date_end)}</span>
                <span>{hoveredTournament.level}</span>
                {hoveredTournament.entry_fee_min && <span>${hoveredTournament.entry_fee_min}+</span>}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
