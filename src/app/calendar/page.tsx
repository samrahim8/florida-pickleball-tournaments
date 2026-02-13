'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { Tournament } from '@/types/database'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    loadTournaments()
  }, [year, month])

  const loadTournaments = async () => {
    setLoading(true)
    const supabase = createClient()

    // Get first and last day of current month view (including overflow days)
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Extend range to include tournaments that span into this month
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

  const getTournamentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tournaments.filter(t => {
      const start = t.date_start
      const end = t.date_end || t.date_start
      return dateStr >= start && dateStr <= end
    })
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

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  // Get tournaments for selected date
  const selectedDateTournaments = selectedDate ? getTournamentsForDate(selectedDate) : []

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl text-[#2C2C2C]">Tournament Calendar</h1>
              <p className="text-[#6B6560] mt-1">Find tournaments by date</p>
            </div>
            <Link href="/tournaments" className="btn-secondary text-sm">
              List View
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
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
                <div className="grid grid-cols-7 border-b border-[#E8E2D9]">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-[#9A948D] uppercase tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {/* Empty cells for days before the 1st */}
                  {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square border-b border-r border-[#E8E2D9] bg-[#F5F0E8]/30" />
                  ))}

                  {/* Days of the month */}
                  {daysArray.map((day) => {
                    const date = new Date(year, month, day)
                    const dayTournaments = getTournamentsForDate(date)
                    const hasTournaments = dayTournaments.length > 0
                    const isCurrentDay = isToday(date)
                    const isSelected = isSameDay(date, selectedDate)

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square border-b border-r border-[#E8E2D9] p-1 sm:p-2 flex flex-col items-start transition-colors relative ${
                          isSelected
                            ? 'bg-[#2D4A3E]/10'
                            : hasTournaments
                            ? 'hover:bg-[#F5F0E8] cursor-pointer'
                            : 'hover:bg-[#F5F0E8]/50'
                        }`}
                      >
                        <span
                          className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                            isCurrentDay
                              ? 'bg-[#C4704A] text-white'
                              : isSelected
                              ? 'bg-[#2D4A3E] text-white'
                              : 'text-[#2C2C2C]'
                          }`}
                        >
                          {day}
                        </span>

                        {/* Tournament indicators */}
                        {hasTournaments && (
                          <div className="mt-1 w-full space-y-0.5 overflow-hidden">
                            {dayTournaments.slice(0, 2).map((t) => (
                              <div
                                key={t.id}
                                className={`text-[10px] sm:text-xs truncate px-1 py-0.5 rounded ${
                                  t.featured
                                    ? 'bg-[#C4704A]/20 text-[#C4704A]'
                                    : 'bg-[#2D4A3E]/10 text-[#2D4A3E]'
                                }`}
                              >
                                <span className="hidden sm:inline">{t.name}</span>
                                <span className="sm:hidden">{t.name.substring(0, 8)}...</span>
                              </div>
                            ))}
                            {dayTournaments.length > 2 && (
                              <div className="text-[10px] text-[#9A948D] px-1">
                                +{dayTournaments.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 text-sm text-[#6B6560]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C4704A]" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#C4704A]/20" />
                  <span>Featured</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#2D4A3E]/10" />
                  <span>Tournament</span>
                </div>
              </div>
            </div>

            {/* Selected Date Panel */}
            <div className="lg:col-span-1">
              <div className="bg-[#FFFDF9] rounded-xl border border-[#E8E2D9] p-6 sticky top-24">
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
                        {selectedDateTournaments.map((tournament) => (
                          <Link
                            key={tournament.id}
                            href={`/tournaments/${tournament.slug}`}
                            className="block p-4 rounded-lg border border-[#E8E2D9] hover:border-[#C4704A]/30 hover:bg-[#F5F0E8]/50 transition-colors"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              {tournament.featured && (
                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#C4704A]/10 text-[#C4704A] uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium text-[#2C2C2C] mb-1">
                              {tournament.name}
                            </h4>
                            <p className="text-sm text-[#6B6560]">
                              {tournament.city}, {tournament.region}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-[#9A948D]">
                              <span>{tournament.level}</span>
                              {tournament.entry_fee_min && (
                                <>
                                  <span>•</span>
                                  <span>${tournament.entry_fee_min}+</span>
                                </>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 text-center py-8">
                        <div className="w-12 h-12 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-[#6B6560]">No tournaments on this day</p>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
