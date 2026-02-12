'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/signin')
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')

      // Check if already has organizer profile
      const { data: organizer } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (organizer) {
        router.push('/submit')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.from('organizers').insert({
      user_id: userId,
      name,
      email,
      phone: phone || null,
      website: website || null,
      bio: bio || null,
      verified: false,
    } as any)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/submit')
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
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#2D4A3E] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-[#FAF7F2]" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg text-[#2C2C2C] tracking-tight">Florida Pickleball</span>
            <span className="text-[10px] text-[#9A948D] uppercase tracking-widest -mt-0.5">Tournaments</span>
          </div>
        </Link>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[#C4704A] text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div className="w-16 h-1 bg-[#E8E2D9] rounded" />
          <div className="w-8 h-8 bg-[#E8E2D9] text-[#9A948D] rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-8">
          <h1 className="text-2xl text-[#2C2C2C] mb-2">
            Set Up Your Organizer Profile
          </h1>
          <p className="text-[#6B6560] mb-8">
            This info will be displayed on your tournament listings.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                Organization / Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
                placeholder="e.g., Miami Pickleball Club"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-[#2C2C2C] mb-1.5">
                About You / Your Organization
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[#FFFDF9] border border-[#E8E2D9] rounded px-4 py-3 focus:outline-none focus:border-[#C4704A] focus:ring-1 focus:ring-[#C4704A]/20 resize-none text-[#2C2C2C] placeholder-[#9A948D]"
                placeholder="Tell players a bit about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
