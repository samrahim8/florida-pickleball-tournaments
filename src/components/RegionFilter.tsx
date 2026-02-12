'use client'

import { FLORIDA_REGIONS } from '@/lib/constants'
import { FloridaRegion } from '@/types/database'

interface RegionFilterProps {
  selected: FloridaRegion | null
  onChange: (region: FloridaRegion | null) => void
}

export default function RegionFilter({ selected, onChange }: RegionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          selected === null
            ? 'bg-[#2D4A3E] text-white'
            : 'bg-[#FFFDF9] text-[#6B6560] hover:bg-[#F5F0E8]'
        }`}
      >
        All Regions
      </button>
      {FLORIDA_REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onChange(region)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            selected === region
              ? 'bg-[#2D4A3E] text-white'
              : 'bg-[#FFFDF9] text-[#6B6560] hover:bg-[#F5F0E8]'
          }`}
        >
          {region}
        </button>
      ))}
    </div>
  )
}
