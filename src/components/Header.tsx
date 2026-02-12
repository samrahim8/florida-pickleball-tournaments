'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const userMenuRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <header className="bg-[#FFFDF9] border-b border-[#E8E2D9] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/tournaments" className="text-[#6B6560] hover:text-[#2C2C2C] font-medium transition-colors text-sm tracking-wide">
              Browse
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-[#6B6560] hover:text-[#2C2C2C] font-medium transition-colors text-sm tracking-wide">
                      Dashboard
                    </Link>
                    {/* User dropdown */}
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 p-2 rounded-full hover:bg-[#F5F0E8] transition-colors"
                      >
                        <div className="w-8 h-8 bg-[#C4704A] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#FFFDF9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <svg className={`w-4 h-4 text-[#9A948D] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-[#FFFDF9] rounded-lg shadow-lg border border-[#E8E2D9] py-2 z-50">
                          <Link
                            href="/account"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-[#6B6560] hover:bg-[#F5F0E8] hover:text-[#2C2C2C] transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Account Settings
                          </Link>
                          <div className="h-px bg-[#E8E2D9] my-2" />
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-3 text-[#6B6560] hover:bg-[#F5F0E8] hover:text-[#2C2C2C] transition-colors w-full text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link href="/signin" className="btn-primary text-sm py-2.5 px-6">
                    Sign In
                  </Link>
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
            <svg className="w-6 h-6 text-[#6B6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t border-[#E8E2D9] mt-4 flex flex-col gap-1">
            <Link
              href="/tournaments"
              className="text-[#6B6560] hover:text-[#2C2C2C] font-medium py-3 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Tournaments
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-[#6B6560] hover:text-[#2C2C2C] font-medium py-3 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      className="text-[#6B6560] hover:text-[#2C2C2C] font-medium py-3 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false) }}
                      className="text-[#9A948D] hover:text-[#6B6560] font-medium py-3 text-left transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/signin"
                    className="btn-primary text-center mt-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
