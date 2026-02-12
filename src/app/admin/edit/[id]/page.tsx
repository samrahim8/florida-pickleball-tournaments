'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import { createClient } from '@/lib/supabase'
import { uploadTournamentImage, deleteTournamentImage } from '@/lib/storage'
import { FLORIDA_REGIONS, SKILL_LEVELS, TOURNAMENT_FORMATS, TOURNAMENT_CATEGORIES } from '@/lib/constants'
import { FloridaRegion, SkillLevel, Tournament, TournamentStatus } from '@/types/database'

const STATUSES: TournamentStatus[] = ['pending', 'approved', 'rejected']

export default function AdminEditTournamentPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tournament, setTournament] = useState<Tournament | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [city, setCity] = useState('')
  const [county, setCounty] = useState('')
  const [region, setRegion] = useState<FloridaRegion>('South Florida')
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
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
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [status, setStatus] = useState<TournamentStatus>('pending')
  const [featured, setFeatured] = useState(false)

  useEffect(() => {
    const loadTournament = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/signin')
        return
      }

      // Check if user is admin
      const { data: organizer } = await supabase
        .from('organizers')
        .select('id, is_admin')
        .eq('user_id', user.id)
        .single()

      if (!organizer || !(organizer as any).is_admin) {
        router.push('/dashboard')
        return
      }

      // Get tournament (no organizer_id check - admin can edit any)
      const { data: tourn } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()

      if (!tourn) {
        router.push('/admin')
        return
      }

      const t = tourn as Tournament
      setTournament(t)
      setName(t.name)
      setDescription(t.description || '')
      setDateStart(t.date_start)
      setDateEnd(t.date_end || '')
      setRegistrationDeadline(t.registration_deadline || '')
      setCity(t.city)
      setCounty(t.county || '')
      setRegion(t.region as FloridaRegion)
      setVenueName(t.venue_name || '')
      setVenueAddress(t.venue_address || '')
      setLat(t.lat || null)
      setLng(t.lng || null)
      setLevel(t.level as SkillLevel)
      setFormat(t.format || '')
      setCategories(t.categories || [])
      setEntryFeeMin(t.entry_fee_min?.toString() || '')
      setEntryFeeMax(t.entry_fee_max?.toString() || '')
      setMaxParticipants(t.max_participants?.toString() || '')
      setRegistrationUrl(t.registration_url || '')
      setPrizePool(t.prize_pool || '')
      setImageUrl(t.image_url)
      setStatus(t.status)
      setFeatured(t.featured)
      setLoading(false)
    }

    loadTournament()
  }, [router, tournamentId])

  const handleCategoryToggle = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournament) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    // Handle image changes
    let newImageUrl = imageUrl

    if (imageRemoved && imageUrl) {
      await deleteTournamentImage(imageUrl)
      newImageUrl = null
    }

    if (imageFile) {
      if (imageUrl) {
        await deleteTournamentImage(imageUrl)
      }
      newImageUrl = await uploadTournamentImage(imageFile, tournament.id)
      if (!newImageUrl) {
        setError('Failed to upload image. Please try again.')
        setSaving(false)
        return
      }
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('tournaments')
      .update({
        name,
        description: description || null,
        date_start: dateStart,
        date_end: dateEnd || dateStart,
        registration_deadline: registrationDeadline || null,
        city,
        county: county || null,
        region,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        lat,
        lng,
        level,
        format: format || null,
        categories,
        entry_fee_min: entryFeeMin ? parseFloat(entryFeeMin) : null,
        entry_fee_max: entryFeeMax ? parseFloat(entryFeeMax) : null,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        registration_url: registrationUrl || null,
        prize_pool: prizePool || null,
        image_url: newImageUrl,
        status,
        featured,
      })
      .eq('id', tournament.id)

    if (error) {
      setError(error.message)
    } else {
      setImageUrl(newImageUrl)
      setImageFile(null)
      setImageRemoved(false)
      setSuccess(true)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!tournament) return
    if (!confirm('Are you sure you want to delete this tournament? This cannot be undone.')) return

    setDeleting(true)
    setError(null)

    if (tournament.image_url) {
      await deleteTournamentImage(tournament.image_url)
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournament.id)

    if (error) {
      setError(error.message)
      setDeleting(false)
    } else {
      router.push('/admin')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C4704A] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/admin" className="text-sm text-[#6B6560] hover:text-[#C4704A] mb-2 inline-block">
              &larr; Back to Admin
            </Link>
            <h1 className="text-3xl text-[#2C2C2C]">Edit Tournament</h1>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {success && (
          <div className="bg-[#2D4A3E]/10 border border-[#2D4A3E]/20 text-[#2D4A3E] px-4 py-3 rounded mb-6 text-sm">
            Tournament updated successfully.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Status & Featured (Admin Only) */}
          <div className="bg-[#2D4A3E]/5 rounded-lg border border-[#2D4A3E]/20 p-6">
            <h2 className="font-serif text-lg text-[#2D4A3E] mb-4">Admin Controls</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TournamentStatus)}
                  className="w-full"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 rounded border-[#E8E2D9] text-[#C4704A] focus:ring-[#C4704A]"
                  />
                  <span className="text-sm font-medium text-[#2C2C2C]">Featured Tournament</span>
                </label>
              </div>
            </div>
          </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  Tournament Flyer
                </label>
                <ImageUpload
                  value={imageRemoved ? null : imageUrl}
                  onChange={(file) => {
                    setImageFile(file)
                    setImageRemoved(false)
                  }}
                  onRemove={() => {
                    setImageRemoved(true)
                    setImageFile(null)
                  }}
                />
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
                  Venue Location
                </label>
                <LocationAutocomplete
                  value={venueName}
                  onChange={(place) => {
                    if (place) {
                      setVenueName(place.name)
                      setVenueAddress(place.address)
                      setCity(place.city || city)
                      setCounty(place.county)
                      setRegion(place.region)
                      setLat(place.lat)
                      setLng(place.lng)
                    } else {
                      setVenueName('')
                      setVenueAddress('')
                      setCounty('')
                      setLat(null)
                      setLng(null)
                    }
                  }}
                  placeholder="Search for a venue..."
                />
                {venueAddress && (
                  <p className="text-xs text-[#6B6560] mt-1">{venueAddress}</p>
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
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
