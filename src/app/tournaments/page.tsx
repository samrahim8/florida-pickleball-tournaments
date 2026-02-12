import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TournamentsList from './TournamentsList'

export const metadata = {
  title: 'Browse Tournaments | Florida Pickleball Tournaments',
  description: 'Find pickleball tournaments across Florida. Filter by region, skill level, and date.',
}

export default function TournamentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Page Header */}
      <section className="bg-[#2D4A3E] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl text-[#FAF7F2]">
            Browse Tournaments
          </h1>
          <p className="text-[#FAF7F2]/70 mt-2">
            Find your next competition across the Sunshine State
          </p>
        </div>
      </section>

      <main className="flex-grow bg-[#F5F0E8]">
        <Suspense fallback={<TournamentsLoading />}>
          <TournamentsList />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

function TournamentsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-[#FAF7F2] rounded w-full max-w-md" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-[#FAF7F2] rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
