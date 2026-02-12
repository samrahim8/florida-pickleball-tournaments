import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">FL Pickleball</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              The complete guide to pickleball tournaments across the Sunshine State.
            </p>
          </div>

          {/* Regions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Regions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tournaments?region=South+Florida" className="text-gray-500 hover:text-orange-600 transition-colors">South Florida</Link></li>
              <li><Link href="/tournaments?region=Central+Florida" className="text-gray-500 hover:text-orange-600 transition-colors">Central Florida</Link></li>
              <li><Link href="/tournaments?region=Tampa+Bay" className="text-gray-500 hover:text-orange-600 transition-colors">Tampa Bay</Link></li>
              <li><Link href="/tournaments?region=North+Florida" className="text-gray-500 hover:text-orange-600 transition-colors">North Florida</Link></li>
              <li><Link href="/tournaments?region=Panhandle" className="text-gray-500 hover:text-orange-600 transition-colors">Panhandle</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tournaments" className="text-gray-500 hover:text-orange-600 transition-colors">Browse Tournaments</Link></li>
              <li><Link href="/submit" className="text-gray-500 hover:text-orange-600 transition-colors">Submit a Tournament</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Florida Pickleball Tournaments</p>
        </div>
      </div>
    </footer>
  )
}
