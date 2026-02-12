'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // For now, just simulate success
    // In production, you'd call an API to save the email
    await new Promise(resolve => setTimeout(resolve, 500))

    setSuccess(true)
    setLoading(false)
    setEmail('')
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-[#FAF7F2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#FAF7F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[#FAF7F2] font-medium">You&apos;re on the list!</p>
        <p className="text-[#7A8B7A] text-sm mt-1">We&apos;ll let you know when new tournaments are added.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter your email"
        className="flex-grow px-4 py-3 rounded bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-[#FAF7F2] placeholder-[#7A8B7A] focus:outline-none focus:border-[#FAF7F2]/40 focus:ring-1 focus:ring-[#FAF7F2]/20"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-[#C4704A] text-[#FAF7F2] font-medium rounded hover:bg-[#A85D3B] transition-colors disabled:opacity-50"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </form>
  )
}
