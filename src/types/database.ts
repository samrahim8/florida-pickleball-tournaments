export type FloridaRegion =
  | 'South Florida'
  | 'Central Florida'
  | 'Tampa Bay'
  | 'North Florida'
  | 'Panhandle'

export type SkillLevel =
  | 'Amateur'
  | 'Intermediate'
  | 'Pro/Open'
  | 'Seniors (50+)'
  | 'All Levels'

export type TournamentStatus = 'pending' | 'upcoming' | 'active' | 'completed' | 'cancelled'

export type TournamentTier = 'free' | 'pro' | 'premium'

export type PartnerTier = 'standard' | 'premium' | 'title'

export type TournamentCategory =
  | 'College'
  | 'Junior'
  | 'Moneyball'
  | 'Non-profit'
  | 'Seniors'
  | 'Open'
  | 'Mixed'
  | 'Charity'

export interface Organizer {
  id: string
  name: string
  email: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
  bio: string | null
  verified: boolean
  user_id: string | null
  created_at: string
  updated_at: string
}

export interface Venue {
  id: string
  name: string
  address: string | null
  city: string
  county: string | null
  region: FloridaRegion
  lat: number | null
  lng: number | null
  court_count: number | null
  indoor: boolean
  outdoor: boolean
  surface_type: string | null
  amenities: string[] | null
  photo_url: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  name: string
  slug: string
  description: string | null
  date_start: string
  date_end: string
  registration_deadline: string | null
  venue_id: string | null
  organizer_id: string | null
  city: string
  county: string | null
  region: FloridaRegion
  level: SkillLevel
  categories: string[]
  featured: boolean
  featured_until: string | null
  registration_url: string | null
  entry_fee_min: number | null
  entry_fee_max: number | null
  max_participants: number | null
  format: string | null
  prize_pool: string | null
  image_url: string | null
  status: TournamentStatus
  tier: TournamentTier
  results_url: string | null
  results_summary: string | null
  click_count: number
  view_count: number
  created_at: string
  updated_at: string
  // Joined relations
  venue?: Venue | null
  organizer?: Organizer | null
}

export interface Subscriber {
  id: string
  email: string
  region: FloridaRegion | null
  subscribed_at: string
  active: boolean
}

export interface Partner {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  tier: PartnerTier
  active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface RegistrationClick {
  id: string
  tournament_id: string
  clicked_at: string
  referrer: string | null
  user_agent: string | null
}

export interface Database {
  public: {
    Tables: {
      organizers: {
        Row: Organizer
        Insert: Omit<Organizer, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Organizer, 'id' | 'created_at' | 'updated_at'>>
      }
      venues: {
        Row: Venue
        Insert: Omit<Venue, 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Omit<Venue, 'id' | 'created_at' | 'updated_at'>>
      }
      tournaments: {
        Row: Tournament
        Insert: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'click_count' | 'view_count' | 'venue' | 'organizer'> & { id?: string }
        Update: Partial<Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'venue' | 'organizer'>>
      }
      subscribers: {
        Row: Subscriber
        Insert: Omit<Subscriber, 'id' | 'subscribed_at'> & { id?: string }
        Update: Partial<Omit<Subscriber, 'id' | 'subscribed_at'>>
      }
      partners: {
        Row: Partner
        Insert: Omit<Partner, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<Partner, 'id' | 'created_at'>>
      }
      registration_clicks: {
        Row: RegistrationClick
        Insert: Omit<RegistrationClick, 'id' | 'clicked_at'> & { id?: string }
        Update: Partial<Omit<RegistrationClick, 'id' | 'clicked_at'>>
      }
    }
    Enums: {
      florida_region: FloridaRegion
      skill_level: SkillLevel
    }
  }
}
