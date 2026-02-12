'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface PlaceResult {
  name: string
  address: string
  city: string
  lat: number
  lng: number
}

interface LocationAutocompleteProps {
  value: string
  onChange: (place: PlaceResult | null) => void
  placeholder?: string
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search for a venue or address..."
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setIsLoaded(true)
    }
  }, [])

  // Initialize services when loaded
  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current = new google.maps.places.AutocompleteService()
      // Create a dummy div for PlacesService (required)
      const div = document.createElement('div')
      placesService.current = new google.maps.places.PlacesService(div)
    }
  }, [isLoaded])

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchPlaces = useCallback((input: string) => {
    if (!autocompleteService.current || !input.trim()) {
      setSuggestions([])
      return
    }

    autocompleteService.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'us' },
        // Bias towards Florida
        locationBias: {
          center: { lat: 27.6648, lng: -81.5158 },
          radius: 500000, // 500km radius covering Florida
        } as any,
        types: ['establishment', 'geocode'],
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setIsOpen(true)
        } else {
          setSuggestions([])
        }
      }
    )
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    searchPlaces(val)

    if (!val.trim()) {
      onChange(null)
    }
  }

  const selectPlace = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'address_components'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Extract city from address components
          let city = ''
          place.address_components?.forEach((component) => {
            if (component.types.includes('locality')) {
              city = component.long_name
            }
          })

          const result: PlaceResult = {
            name: place.name || prediction.structured_formatting.main_text,
            address: place.formatted_address || prediction.description,
            city: city,
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          }

          setInputValue(result.name)
          setSuggestions([])
          setIsOpen(false)
          onChange(result)
        }
      }
    )
  }

  const handleClear = () => {
    setInputValue('')
    setSuggestions([])
    setIsOpen(false)
    onChange(null)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F5F0E8] rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-[#9A948D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#FFFDF9] border border-[#E8E2D9] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => selectPlace(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-[#F5F0E8] transition-colors border-b border-[#E8E2D9] last:border-b-0"
            >
              <div className="font-medium text-[#2C2C2C] text-sm">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="text-xs text-[#6B6560] mt-0.5">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </button>
          ))}
        </div>
      )}

      {!isLoaded && (
        <p className="text-xs text-[#9A948D] mt-1">Loading location search...</p>
      )}
    </div>
  )
}
