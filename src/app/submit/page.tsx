'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import { createClient } from '@/lib/supabase'
import { uploadTournamentImage } from '@/lib/storage'
import { FLORIDA_REGIONS, SKILL_LEVELS, TOURNAMENT_FORMATS, TOURNAMENT_CATEGORIES } from '@/lib/constants'
import { FloridaRegion, SkillLevel } from '@/types/database'

export default function SubmitTournamentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [organizerId, setOrganizerId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState<FloridaRegion>('South Florida')
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [county, setCounty] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [level, setLevel] = useState<SkillLevel>('All Levels')
  const [format, setFormat] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [entryFeeMin, setEntryFeeMin] = useState('')
  const [entryFeeMax, setEntryFeeMax] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [registrationUrl, setRegistrationUrl] = useState('')
  const [prizePool, setPrizePool] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/signin')
        return
      }

      // Check for organizer profile
      const { data: organizer } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!organizer) {
        router.push('/onboarding')
        return
      }

      setOrganizerId((organizer as any).id)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
  }

  const handleCategoryToggle = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleLocationSelect = (place: { name: string; address: string; city: string; county: string; region: FloridaRegion; lat: number; lng: number } | null) => {
    if (place) {
      setVenueName(place.name)
      setVenueAddress(place.address)
      setCity(place.city || city) // Keep existing city if not found
      setCounty(place.county)
      setRegion(place.region) // Auto-set region based on county
      setLat(place.lat)
      setLng(place.lng)
    } else {
      setVenueName('')
      setVenueAddress('')
      setCounty('')
      setLat(null)
      setLng(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizerId) return

    setSaving(true)
    setError(null)

    const slug = generateSlug(name) + '-' + Date.now().toString(36)
    const tournamentId = crypto.randomUUID()

    // Upload image if provided
    let imageUrl: string | null = null
    if (imageFile) {
      const uploadResult = await uploadTournamentImage(imageFile, tournamentId)
      if (uploadResult.error) {
        setError(uploadResult.error)
        setSaving(false)
        return
      }
      imageUrl = uploadResult.url
    }

    const supabase = createClient()
    const { error } = await supabase.from('tournaments').insert({
      id: tournamentId,
      name,
      slug,
      description: description || null,
      date_start: dateStart,
      date_end: dateEnd || dateStart,
      registration_deadline: registrationDeadline || null,
      city,
      county: county || null,
      region,
      venue_name: venueName || null,
      venue_address: venueAddress || null,
      lat: lat,
      lng: lng,
      level,
      format: format || null,
      categories,
      entry_fee_min: entryFeeMin ? parseFloat(entryFeeMin) : null,
      entry_fee_max: entryFeeMax ? parseFloat(entryFeeMax) : null,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      registration_url: registrationUrl || null,
      prize_pool: prizePool || null,
      image_url: imageUrl,
      organizer_id: organizerId,
      status: 'pending',
      featured: false,
    } as any)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      setSuccess(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C4704A] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Header />
        <div className="max-w-xl mx-auto py-20 px-4 text-center">
          <div className="w-16 h-16 bg-[#2D4A3E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#2D4A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl text-[#2C2C2C] mb-2">Tournament Submitted!</h1>
          <p className="text-[#6B6560] mb-8">
            Your tournament has been submitted for review. We&apos;ll notify you once it&apos;s approved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit" onClick={() => { setSuccess(false); resetForm() }} className="btn-primary">
              Submit Another
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setDateStart('')
    setDateEnd('')
    setRegistrationDeadline('')
    setCity('')
    setCounty('')
    setRegion('South Florida')
    setVenueName('')
    setVenueAddress('')
    setLat(null)
    setLng(null)
    setLevel('All Levels')
    setFormat('')
    setCategories([])
    setEntryFeeMin('')
    setEntryFeeMax('')
    setMaxParticipants('')
    setRegistrationUrl('')
    setPrizePool('')
    setImageFile(null)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="mb-10">
          <h1 className="text-3xl text-[#2C2C2C]">Submit a Tournament</h1>
          <p className="text-[#6B6560] mt-2">
            Fill out the details below to list your tournament.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
            <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Tournament Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                  placeholder="e.g., Miami Open Pickleball Championship"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-[#FFFDF9] border border-[#E8E2D9] rounded px-4 py-3 focus:outline-none focus:border-[#C4704A] focus:ring-1 focus:ring-[#C4704A]/20 resize-none text-[#2C2C2C] placeholder-[#9A948D]"
                  placeholder="Tell players what makes this tournament special..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  Tournament Flyer
                </label>
                <ImageUpload
                  value={null}
                  onChange={(file) => setImageFile(file)}
                />
                <p className="text-xs text-[#9A948D] mt-2">
                  Upload a square image for your tournament flyer (shown on detail page)
                </p>
              </div>
            </div>
          </div>

          {/* Date & Location */}
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
            <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Date & Location</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Venue <span className="text-red-500">*</span>
                </label>
                <LocationAutocomplete
                  value={venueName}
                  onChange={handleLocationSelect}
                  placeholder="Search for venue or address..."
                />
                {venueAddress && (
                  <p className="text-xs text-[#6B6560] mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {venueAddress}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full"
                    placeholder="e.g., Miami"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as FloridaRegion)}
                    className="w-full"
                  >
                    {FLORIDA_REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Details */}
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
            <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Tournament Details</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Skill Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SkillLevel)}
                    className="w-full"
                  >
                    {SKILL_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full"
                  >
                    <option value="">Select format</option>
                    {TOURNAMENT_FORMATS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOURNAMENT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        categories.includes(cat)
                          ? 'bg-[#C4704A] text-white'
                          : 'bg-[#F5F0E8] text-[#6B6560] hover:bg-[#E8E2D9]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
            <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Registration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Registration URL
                </label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  className="w-full"
                  placeholder="https://pickleballtournaments.com/..."
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Entry Fee (Min)
                  </label>
                  <input
                    type="number"
                    value={entryFeeMin}
                    onChange={(e) => setEntryFeeMin(e.target.value)}
                    className="w-full"
                    placeholder="$0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Entry Fee (Max)
                  </label>
                  <input
                    type="number"
                    value={entryFeeMax}
                    onChange={(e) => setEntryFeeMax(e.target.value)}
                    className="w-full"
                    placeholder="$0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="w-full"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Prize Pool
                </label>
                <input
                  type="text"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  className="w-full"
                  placeholder="e.g., $5,000 total"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Submitting...' : 'Submit Tournament'}
          </button>
        </form>
      </div>
    </div>
  )
}
