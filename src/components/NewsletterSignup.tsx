'use client'

import { useState } from 'react'
import { FLORIDA_REGIONS } from '@/lib/constants'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [region, setRegion] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    // TODO: Implement actual subscription logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    setStatus('success')
    setEmail('')
    setRegion('')
  }

  if (status === 'success') {
    return (
      <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-medium">You&apos;re subscribed!</p>
        <p className="text-gray-400 text-sm mt-1">
          We&apos;ll send you tournament updates.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-grow bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 sm:w-48"
        >
          <option value="" className="text-gray-900">All regions</option>
          {FLORIDA_REGIONS.map((r) => (
            <option key={r} value={r} className="text-gray-900">
              {r}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full sm:w-auto disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  )
}
