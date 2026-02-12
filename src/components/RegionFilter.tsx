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
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
          selected === null
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Regions
      </button>
      {FLORIDA_REGIONS.map((region) => (
        <button
          key={region}
          onClick={() => onChange(region)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
            selected === region
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {region}
        </button>
      ))}
    </div>
  )
}
