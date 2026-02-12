'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase'

interface Organizer {
  id: string
  name: string
  email: string
  phone: string | null
  website: string | null
  bio: string | null
}

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    const loadAccount = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/signin')
        return
      }

      const { data: org } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!org) {
        router.push('/onboarding')
        return
      }

      const organizerData = org as Organizer
      setOrganizer(organizerData)
      setName(organizerData.name)
      setEmail(organizerData.email)
      setPhone(organizerData.phone || '')
      setWebsite(organizerData.website || '')
      setBio(organizerData.bio || '')
      setLoading(false)
    }

    loadAccount()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizer) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error } = await (supabase as any)
      .from('organizers')
      .update({
        name,
        email,
        phone: phone || null,
        website: website || null,
        bio: bio || null,
      })
      .eq('id', organizer.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setSaving(false)
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

      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="mb-10">
          <h1 className="text-3xl text-[#2C2C2C]">Account Settings</h1>
          <p className="text-[#6B6560] mt-2">
            Manage your organizer profile and account information.
          </p>
        </div>

        {success && (
          <div className="bg-[#2D4A3E]/10 border border-[#2D4A3E]/20 text-[#2D4A3E] px-4 py-3 rounded mb-6 text-sm">
            Your profile has been updated successfully.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-[#FFFDF9] rounded-lg border border-[#E8E2D9] p-6">
          <h2 className="font-serif text-lg text-[#2C2C2C] mb-4">Organizer Profile</h2>

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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
