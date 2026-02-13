'use client'

import { useState, useRef, useEffect } from 'react'

interface FilterOption {
  value: string | null
  label: string
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  selected: string | null
  onChange: (value: string | null) => void
  className?: string
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  className = '',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === selected)
  const displayLabel = selectedOption?.label || label

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
          selected !== null
            ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
            : 'bg-[#FFFDF9] text-[#6B6560] border-[#E8E2D9] hover:border-[#C4704A]/30'
        }`}
      >
        <span>{displayLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#FFFDF9] rounded-lg shadow-lg border border-[#E8E2D9] py-1 z-50">
          {options.map((option) => (
            <button
              key={option.value ?? 'all'}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                selected === option.value
                  ? 'bg-[#2D4A3E]/10 text-[#2D4A3E] font-medium'
                  : 'text-[#6B6560] hover:bg-[#F5F0E8]'
              }`}
            >
              <span className="flex items-center justify-between">
                {option.label}
                {selected === option.value && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface MultiFilterDropdownProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
  className?: string
}

export function MultiFilterDropdown({
  label,
  options,
  selected,
  onChange,
  className = '',
}: MultiFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayLabel = selected.length > 0
    ? `${label} (${selected.length})`
    : label

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
          selected.length > 0
            ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
            : 'bg-[#FFFDF9] text-[#6B6560] border-[#E8E2D9] hover:border-[#C4704A]/30'
        }`}
      >
        <span>{displayLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#FFFDF9] rounded-lg shadow-lg border border-[#E8E2D9] py-1 z-50">
          {selected.length > 0 && (
            <>
              <button
                onClick={() => {
                  onChange([])
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-[#C4704A] hover:bg-[#F5F0E8] transition-colors"
              >
                Clear all
              </button>
              <div className="border-t border-[#E8E2D9] my-1" />
            </>
          )}
          {options.map((option) => {
            const isSelected = option.value ? selected.includes(option.value) : false
            return (
              <button
                key={option.value ?? 'all'}
                onClick={() => option.value && toggleOption(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#2D4A3E]/10 text-[#2D4A3E] font-medium'
                    : 'text-[#6B6560] hover:bg-[#F5F0E8]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isSelected ? 'bg-[#2D4A3E] border-[#2D4A3E]' : 'border-[#E8E2D9]'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
