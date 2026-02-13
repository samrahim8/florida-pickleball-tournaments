'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FLORIDA_REGIONS } from '@/lib/constants'
import { FloridaRegion } from '@/types/database'

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

export default function HomeFilters() {
  const router = useRouter()
  const [regionOpen, setRegionOpen] = useState(false)
  const [monthOpen, setMonthOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<FloridaRegion | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionOpen(false)
      }
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
        setMonthOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedRegion) params.set('region', selectedRegion)
    if (selectedMonth) params.set('month', selectedMonth)
    router.push(`/tournaments${params.toString() ? '?' + params.toString() : ''}`)
  }

  const currentMonth = new Date().getMonth() + 1
  const selectedMonthLabel = selectedMonth
    ? MONTHS.find(m => m.value === selectedMonth)?.label
    : null

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-[#9A948D] font-medium uppercase tracking-wide">Find Tournaments</span>
      <span className="text-[#D4CCC0]">|</span>

      {/* Region Dropdown */}
      <div className="relative" ref={regionRef}>
        <button
          onClick={() => { setRegionOpen(!regionOpen); setMonthOpen(false) }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            selectedRegion
              ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
              : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:border-[#C4704A]/30'
          }`}
        >
          <span>{selectedRegion || 'All Regions'}</span>
          <svg className={`w-4 h-4 transition-transform ${regionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {regionOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E8E2D9] py-1 z-50">
            <button
              onClick={() => { setSelectedRegion(null); setRegionOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                !selectedRegion ? 'bg-[#2D4A3E]/10 text-[#2D4A3E] font-medium' : 'text-[#6B6560] hover:bg-[#F5F0E8]'
              }`}
            >
              All Regions
            </button>
            {FLORIDA_REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => { setSelectedRegion(region); setRegionOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  selectedRegion === region ? 'bg-[#2D4A3E]/10 text-[#2D4A3E] font-medium' : 'text-[#6B6560] hover:bg-[#F5F0E8]'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Month Dropdown */}
      <div className="relative" ref={monthRef}>
        <button
          onClick={() => { setMonthOpen(!monthOpen); setRegionOpen(false) }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            selectedMonth
              ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
              : 'bg-white text-[#6B6560] border-[#E8E2D9] hover:border-[#C4704A]/30'
          }`}
        >
          <span>{selectedMonthLabel || 'Any Month'}</span>
          <svg className={`w-4 h-4 transition-transform ${monthOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {monthOpen && (
          <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-[#E8E2D9] py-1 z-50 max-h-64 overflow-y-auto">
            <button
              onClick={() => { setSelectedMonth(null); setMonthOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                !selectedMonth ? 'bg-[#2D4A3E]/10 text-[#2D4A3E] font-medium' : 'text-[#6B6560] hover:bg-[#F5F0E8]'
              }`}
            >
              Any Month
            </button>
            {MONTHS.map((month) => (
              <button
                key={month.value}
                onClick={() => { setSelectedMonth(month.value); setMonthOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  selectedMonth === month.value ? 'bg-[#2D4A3E]/10 text-[#2D4A3E] font-medium' : 'text-[#6B6560] hover:bg-[#F5F0E8]'
                } ${parseInt(month.value) === currentMonth ? 'font-medium' : ''}`}
              >
                {month.label}
                {parseInt(month.value) === currentMonth && (
                  <span className="ml-2 text-xs text-[#C4704A]">Now</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="px-5 py-2 text-sm font-medium bg-[#C4704A] text-white rounded-lg hover:bg-[#A85D3B] transition-colors"
      >
        Search
      </button>

      {(selectedRegion || selectedMonth) && (
        <button
          onClick={() => { setSelectedRegion(null); setSelectedMonth(null) }}
          className="px-3 py-2 text-sm font-medium text-[#C4704A] hover:text-[#A85D3B] transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
