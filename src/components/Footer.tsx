import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#FFFDF9] border-t border-[#E8E2D9]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
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
            </div>
            <p className="text-[#6B6560] text-sm leading-relaxed max-w-sm">
              The complete guide to pickleball tournaments across the Sunshine State. Find your next competition, connect with the community.
            </p>
          </div>

          {/* Regions */}
          <div>
            <h4 className="font-serif text-[#2C2C2C] mb-4">Regions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tournaments?region=South+Florida" className="text-[#6B6560] hover:text-[#C4704A] transition-colors">South Florida</Link></li>
              <li><Link href="/tournaments?region=Central+Florida" className="text-[#6B6560] hover:text-[#C4704A] transition-colors">Central Florida</Link></li>
              <li><Link href="/tournaments?region=Tampa+Bay" className="text-[#6B6560] hover:text-[#C4704A] transition-colors">Tampa Bay</Link></li>
              <li><Link href="/tournaments?region=North+Florida" className="text-[#6B6560] hover:text-[#C4704A] transition-colors">North Florida</Link></li>
              <li><Link href="/tournaments?region=Panhandle" className="text-[#6B6560] hover:text-[#C4704A] transition-colors">Panhandle</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-[#2C2C2C] mb-4">Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tournaments" className="text-[#6B6560] hover:text-[#C4704A] transition-colors">Browse Tournaments</Link></li>
              <li><Link href="/submit" className="text-[#6B6560] hover:text-[#C4704A] transition-colors">Submit a Tournament</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E8E2D9] mt-10 pt-8 text-center text-sm text-[#9A948D]">
          <p>&copy; {new Date().getFullYear()} Florida Pickleball Tournaments</p>
        </div>
      </div>
    </footer>
  )
}
