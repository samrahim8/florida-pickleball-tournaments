'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-lg">FL Pickleball</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/tournaments" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Browse
            </Link>
            <Link href="/tournaments?region=South+Florida" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Regions
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href="/submit" className="btn-primary text-sm py-2.5 px-5">
                      Submit Tournament
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/signin" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                      Sign In
                    </Link>
                    <Link href="/signup" className="btn-primary text-sm py-2.5 px-5">
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-4 flex flex-col gap-3">
            <Link
              href="/tournaments"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Tournaments
            </Link>
            <Link
              href="/tournaments?region=South+Florida"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              By Region
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/submit"
                      className="btn-primary text-center mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Submit Tournament
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false) }}
                      className="text-gray-500 hover:text-gray-700 font-medium py-2 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="text-gray-700 hover:text-gray-900 font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary text-center mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
