'use client'

import { useEffect, useRef, useState } from 'react'

interface VenueMapProps {
  lat: number
  lng: number
  venueName?: string
}

export default function VenueMap({ lat, lng, venueName }: VenueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      script.async = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setIsLoaded(true)
    }
  }, [])

  // Initialize map when loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    // Add marker
    new google.maps.Marker({
      position: { lat, lng },
      map,
      title: venueName || 'Tournament Venue',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#C4704A',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      }
    })

    mapInstanceRef.current = map
  }, [isLoaded, lat, lng, venueName])

  // Update map center if coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng })
    }
  }, [lat, lng])

  if (!isLoaded) {
    return (
      <div className="w-full h-48 bg-[#F5F0E8] rounded-lg flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#C4704A] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-48 rounded-lg overflow-hidden"
      style={{ minHeight: '192px' }}
    />
  )
}
