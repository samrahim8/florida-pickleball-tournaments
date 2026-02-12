import { FloridaRegion, SkillLevel, TournamentCategory } from '@/types/database'

export const FLORIDA_REGIONS: FloridaRegion[] = [
  'South Florida',
  'Central Florida',
  'Tampa Bay',
  'North Florida',
  'Panhandle',
]

export const SKILL_LEVELS: SkillLevel[] = [
  'All Levels',
  'Amateur',
  'Intermediate',
  'Pro/Open',
  'Seniors (50+)',
]

export const TOURNAMENT_CATEGORIES: TournamentCategory[] = [
  'Open',
  'Mixed',
  'Seniors',
  'Junior',
  'College',
  'Charity',
  'Non-profit',
  'Moneyball',
]

export const TOURNAMENT_FORMATS = [
  'Double Elimination',
  'Single Elimination',
  'Round Robin',
  'Pool Play',
  'Pool Play + Bracket',
]

export const SURFACE_TYPES = [
  'Concrete',
  'Sport Court',
  'Asphalt',
  'Wood',
  'Cushioned',
]

export const VENUE_AMENITIES = [
  'Parking',
  'Restrooms',
  'Food & Beverage',
  'Pro Shop',
  'Air Conditioning',
  'Spectator Seating',
  'Locker Rooms',
  'Water Fountains',
]
