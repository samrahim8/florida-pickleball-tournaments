-- Seed Data for Florida Pickleball Tournaments
-- Run this AFTER schema.sql

-- Insert Organizers
INSERT INTO organizers (id, name, email, phone, website, bio, verified) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Florida Pickleball Association', 'info@flapickleball.org', '(305) 555-0100', 'https://flapickleball.org', 'The official governing body for pickleball in Florida. We organize sanctioned tournaments across the state and promote the growth of the sport.', true),
  ('a2222222-2222-2222-2222-222222222222', 'Sunshine State Pickleball', 'tournaments@sunshinepb.com', '(813) 555-0200', 'https://sunshinepb.com', 'Premier tournament organizer serving Tampa Bay and Central Florida since 2019.', true),
  ('a3333333-3333-3333-3333-333333333333', 'Miami Dink Club', 'play@miamidink.com', '(786) 555-0300', 'https://miamidink.com', 'South Florida''s largest pickleball community. Weekly leagues and monthly tournaments.', true),
  ('a4444444-4444-4444-4444-444444444444', 'Panhandle Pickleball Tours', 'info@panhandlepb.com', '(850) 555-0400', 'https://panhandlepb.com', 'Bringing competitive pickleball to Northwest Florida and the Emerald Coast.', false),
  ('a5555555-5555-5555-5555-555555555555', 'Jacksonville Paddle Sports', 'contact@jaxpaddle.com', '(904) 555-0500', 'https://jaxpaddle.com', 'North Florida''s home for pickleball, paddle tennis, and racquet sports.', true);

-- Insert Venues
INSERT INTO venues (id, name, address, city, county, region, lat, lng, court_count, indoor, outdoor, surface_type, amenities, website) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Bobby Riggs Pickleball Center', '4000 Palm Beach Lakes Blvd', 'West Palm Beach', 'Palm Beach', 'South Florida', 26.7153, -80.0892, 24, false, true, 'Sport Court', ARRAY['Parking', 'Restrooms', 'Pro Shop', 'Food & Beverage', 'Spectator Seating'], 'https://bobbyriggspb.com'),
  ('b2222222-2222-2222-2222-222222222222', 'Pictona at Holly Hill', '1060 Ridgewood Ave', 'Holly Hill', 'Volusia', 'Central Florida', 29.2397, -81.0453, 49, true, true, 'Cushioned', ARRAY['Parking', 'Restrooms', 'Pro Shop', 'Food & Beverage', 'Locker Rooms', 'Air Conditioning'], 'https://pictona.org'),
  ('b3333333-3333-3333-3333-333333333333', 'East Naples Community Park', '3500 Thomasson Dr', 'Naples', 'Collier', 'South Florida', 26.1092, -81.7378, 64, false, true, 'Concrete', ARRAY['Parking', 'Restrooms', 'Water Fountains', 'Spectator Seating'], 'https://colliercountyfl.gov'),
  ('b4444444-4444-4444-4444-444444444444', 'HCA Florida Healthcare Pickleball Complex', '1701 N Dale Mabry Hwy', 'Tampa', 'Hillsborough', 'Tampa Bay', 27.9617, -82.5015, 16, false, true, 'Sport Court', ARRAY['Parking', 'Restrooms', 'Pro Shop', 'Spectator Seating'], 'https://tampapickleball.com'),
  ('b5555555-5555-5555-5555-555555555555', 'Frank Brown Park', '16200 Panama City Beach Pkwy', 'Panama City Beach', 'Bay', 'Panhandle', 30.2163, -85.8317, 20, false, true, 'Concrete', ARRAY['Parking', 'Restrooms', 'Water Fountains'], 'https://pcbparks.com'),
  ('b6666666-6666-6666-6666-666666666666', 'Jarboe Park', '1000 W 17th St', 'Jacksonville', 'Duval', 'North Florida', 30.3538, -81.7041, 12, false, true, 'Asphalt', ARRAY['Parking', 'Restrooms', 'Water Fountains'], 'https://coj.net');

-- Insert Tournaments (mix of past, current, and upcoming)
INSERT INTO tournaments (id, name, slug, description, date_start, date_end, registration_deadline, venue_id, organizer_id, city, county, region, level, categories, featured, featured_until, registration_url, entry_fee_min, entry_fee_max, max_participants, format, prize_pool, status, tier) VALUES

-- PAST TOURNAMENTS (completed)
('c1111111-1111-1111-1111-111111111111',
 'Naples Classic 2024',
 'naples-classic-2024',
 'The premier fall tournament in Southwest Florida. Join us for three days of competitive pickleball at the world-famous East Naples Community Park.',
 '2024-11-15', '2024-11-17', '2024-11-01',
 'b3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111',
 'Naples', 'Collier', 'South Florida', 'Pro/Open',
 ARRAY['Open', 'Seniors', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/naples-classic-2024',
 75.00, 150.00, 256, 'Double Elimination', '$15,000 Total',
 'completed', 'premium'),

('c2222222-2222-2222-2222-222222222222',
 'Tampa Bay Turkey Trot Tournament',
 'tampa-bay-turkey-trot-2024',
 'Annual Thanksgiving weekend tournament. All skill levels welcome!',
 '2024-11-28', '2024-11-30', '2024-11-20',
 'b4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222',
 'Tampa', 'Hillsborough', 'Tampa Bay', 'All Levels',
 ARRAY['Open', 'Mixed', 'Seniors'],
 false, NULL,
 'https://pickleballtournaments.com/tampa-turkey-2024',
 50.00, 100.00, 128, 'Pool Play + Bracket', NULL,
 'completed', 'pro'),

('c3333333-3333-3333-3333-333333333333',
 'Jacksonville Winter Warm-Up',
 'jax-winter-warmup-2025',
 'Kick off the new year with competitive pickleball in North Florida.',
 '2025-01-10', '2025-01-12', '2025-01-03',
 'b6666666-6666-6666-6666-666666666666', 'a5555555-5555-5555-5555-555555555555',
 'Jacksonville', 'Duval', 'North Florida', 'Intermediate',
 ARRAY['Open', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/jax-warmup-2025',
 45.00, 90.00, 96, 'Round Robin', NULL,
 'completed', 'free'),

-- UPCOMING TOURNAMENTS
('c4444444-4444-4444-4444-444444444444',
 'Florida State Championships 2025',
 'florida-state-championships-2025',
 'The biggest pickleball event in Florida! Three days of elite competition featuring players from across the country. MLP-style team event on Sunday.',
 '2025-03-14', '2025-03-16', '2025-03-01',
 'b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111',
 'Holly Hill', 'Volusia', 'Central Florida', 'Pro/Open',
 ARRAY['Open', 'Seniors', 'Mixed', 'Moneyball'],
 true, '2025-03-16',
 'https://pickleballtournaments.com/fl-state-2025',
 100.00, 200.00, 512, 'Pool Play + Bracket', '$50,000 Total',
 'upcoming', 'premium'),

('c5555555-5555-5555-5555-555555555555',
 'Miami Beach Open',
 'miami-beach-open-2025',
 'Play pickleball with an ocean breeze! Join us for the most scenic tournament in South Florida.',
 '2025-02-21', '2025-02-23', '2025-02-14',
 NULL, 'a3333333-3333-3333-3333-333333333333',
 'Miami Beach', 'Miami-Dade', 'South Florida', 'All Levels',
 ARRAY['Open', 'Mixed', 'Charity'],
 true, '2025-02-23',
 'https://pickleballtournaments.com/miami-beach-2025',
 60.00, 120.00, 200, 'Double Elimination', '$5,000 Total',
 'upcoming', 'pro'),

('c6666666-6666-6666-6666-666666666666',
 'Emerald Coast Classic',
 'emerald-coast-classic-2025',
 'The Panhandle''s premier pickleball tournament. Beautiful courts, beautiful beaches.',
 '2025-04-04', '2025-04-06', '2025-03-28',
 'b5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444',
 'Panama City Beach', 'Bay', 'Panhandle', 'Intermediate',
 ARRAY['Open', 'Seniors', 'Mixed'],
 true, '2025-04-06',
 'https://pickleballtournaments.com/emerald-coast-2025',
 55.00, 110.00, 160, 'Double Elimination', '$3,000 Total',
 'upcoming', 'pro'),

('c7777777-7777-7777-7777-777777777777',
 'West Palm Beach Spring Smash',
 'wpb-spring-smash-2025',
 'Annual spring tournament at the iconic Bobby Riggs Center. All ages and skill levels.',
 '2025-03-28', '2025-03-30', '2025-03-21',
 'b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
 'West Palm Beach', 'Palm Beach', 'South Florida', 'All Levels',
 ARRAY['Open', 'Junior', 'Seniors', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/wpb-spring-2025',
 50.00, 100.00, 192, 'Pool Play + Bracket', NULL,
 'upcoming', 'free'),

('c8888888-8888-8888-8888-888888888888',
 'Orlando Metro Championship',
 'orlando-metro-championship-2025',
 'Central Florida''s largest open tournament. Great competition and even better community.',
 '2025-04-11', '2025-04-13', '2025-04-04',
 'b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222',
 'Holly Hill', 'Volusia', 'Central Florida', 'Pro/Open',
 ARRAY['Open', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/orlando-metro-2025',
 75.00, 150.00, 256, 'Double Elimination', '$10,000 Total',
 'upcoming', 'pro'),

('c9999999-9999-9999-9999-999999999999',
 'Tampa Bay Senior Games',
 'tampa-senior-games-2025',
 'Exclusive 50+ tournament celebrating active seniors in the Tampa Bay area.',
 '2025-03-07', '2025-03-09', '2025-02-28',
 'b4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222',
 'Tampa', 'Hillsborough', 'Tampa Bay', 'Seniors (50+)',
 ARRAY['Seniors', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/tampa-seniors-2025',
 40.00, 80.00, 128, 'Round Robin', NULL,
 'upcoming', 'free'),

('ca000000-0000-0000-0000-000000000000',
 'North Florida Amateur Open',
 'nfl-amateur-open-2025',
 'Perfect for players new to tournament play. Supportive environment with coaching tips between matches.',
 '2025-04-25', '2025-04-26', '2025-04-18',
 'b6666666-6666-6666-6666-666666666666', 'a5555555-5555-5555-5555-555555555555',
 'Jacksonville', 'Duval', 'North Florida', 'Amateur',
 ARRAY['Open', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/nfl-amateur-2025',
 35.00, 70.00, 64, 'Round Robin', NULL,
 'upcoming', 'free'),

('cb000000-0000-0000-0000-000000000000',
 'Destin Beach Bash',
 'destin-beach-bash-2025',
 'A fun, laid-back tournament on the beautiful Emerald Coast. Beachside awards ceremony!',
 '2025-05-16', '2025-05-18', '2025-05-09',
 'b5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444',
 'Destin', 'Okaloosa', 'Panhandle', 'All Levels',
 ARRAY['Open', 'Mixed', 'Charity'],
 false, NULL,
 'https://pickleballtournaments.com/destin-bash-2025',
 45.00, 90.00, 120, 'Pool Play', NULL,
 'upcoming', 'free'),

('cc000000-0000-0000-0000-000000000000',
 'Naples Summer Sizzle',
 'naples-summer-sizzle-2025',
 'Beat the heat with early morning matches! Air-conditioned rest areas between games.',
 '2025-06-06', '2025-06-08', '2025-05-30',
 'b3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111',
 'Naples', 'Collier', 'South Florida', 'Intermediate',
 ARRAY['Open', 'Seniors', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/naples-sizzle-2025',
 55.00, 110.00, 144, 'Double Elimination', '$2,500 Total',
 'upcoming', 'free'),

('cd000000-0000-0000-0000-000000000000',
 'Miami Moneyball Madness',
 'miami-moneyball-2025',
 'High-stakes singles and doubles. Winner-take-all format. Are you ready?',
 '2025-05-02', '2025-05-04', '2025-04-25',
 NULL, 'a3333333-3333-3333-3333-333333333333',
 'Miami', 'Miami-Dade', 'South Florida', 'Pro/Open',
 ARRAY['Moneyball', 'Open'],
 true, '2025-05-04',
 'https://pickleballtournaments.com/miami-moneyball-2025',
 150.00, 300.00, 64, 'Single Elimination', '$25,000 Total',
 'upcoming', 'premium'),

('ce000000-0000-0000-0000-000000000000',
 'Gainesville Gator Cup',
 'gainesville-gator-cup-2025',
 'College-focused tournament with open divisions. UF students get discounted entry!',
 '2025-04-18', '2025-04-19', '2025-04-11',
 NULL, 'a5555555-5555-5555-5555-555555555555',
 'Gainesville', 'Alachua', 'North Florida', 'All Levels',
 ARRAY['College', 'Open', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/gator-cup-2025',
 30.00, 60.00, 96, 'Pool Play + Bracket', NULL,
 'upcoming', 'free'),

('cf000000-0000-0000-0000-000000000000',
 'St. Augustine Historic Open',
 'st-augustine-historic-open-2025',
 'Play in America''s oldest city! Tournament followed by historic downtown walking tour.',
 '2025-05-23', '2025-05-25', '2025-05-16',
 NULL, 'a5555555-5555-5555-5555-555555555555',
 'St. Augustine', 'St. Johns', 'North Florida', 'Intermediate',
 ARRAY['Open', 'Seniors', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/st-aug-2025',
 50.00, 100.00, 112, 'Double Elimination', NULL,
 'upcoming', 'free'),

('d0000000-0000-0000-0000-000000000000',
 'Fort Myers Charity Classic',
 'fort-myers-charity-2025',
 'All proceeds benefit local youth sports programs. Family-friendly event with kids zone.',
 '2025-06-20', '2025-06-22', '2025-06-13',
 NULL, 'a1111111-1111-1111-1111-111111111111',
 'Fort Myers', 'Lee', 'South Florida', 'All Levels',
 ARRAY['Charity', 'Open', 'Junior', 'Mixed'],
 false, NULL,
 'https://pickleballtournaments.com/ftmyers-charity-2025',
 40.00, 80.00, 160, 'Round Robin', NULL,
 'upcoming', 'free');

-- Add results to completed tournaments
UPDATE tournaments SET
  results_url = 'https://pickleballtournaments.com/naples-classic-2024/results',
  results_summary = 'Gold medals: Men''s Open - Ben Johns/Collin Johns, Women''s Open - Anna Leigh Waters/Leigh Waters, Mixed Open - Ben Johns/Anna Leigh Waters. Record attendance with 240 players.'
WHERE slug = 'naples-classic-2024';

UPDATE tournaments SET
  results_url = 'https://pickleballtournaments.com/tampa-turkey-2024/results',
  results_summary = 'Great turnout with 120 players across all divisions. Congratulations to all medal winners!'
WHERE slug = 'tampa-bay-turkey-trot-2024';

UPDATE tournaments SET
  results_url = 'https://pickleballtournaments.com/jax-warmup-2025/results',
  results_summary = '88 players competed in the 2025 kickoff event. See full bracket results at the link above.'
WHERE slug = 'jax-winter-warmup-2025';

-- Insert Partners
INSERT INTO partners (name, logo_url, website, description, tier, active, start_date, end_date) VALUES
  ('Selkirk Sport', NULL, 'https://selkirk.com', 'Official paddle sponsor of Florida Pickleball Tournaments', 'title', true, '2025-01-01', '2025-12-31'),
  ('Joola', NULL, 'https://joola.com', 'Premium pickleball equipment and apparel', 'premium', true, '2025-01-01', '2025-12-31'),
  ('Franklin Sports', NULL, 'https://franklinsports.com', 'Balls and accessories for every level', 'standard', true, '2025-01-01', '2025-12-31'),
  ('Diadem Sports', NULL, 'https://diademsports.com', 'Performance gear for competitive players', 'standard', true, '2025-01-01', '2025-12-31');

-- Insert some sample subscribers
INSERT INTO subscribers (email, region, active) VALUES
  ('player1@example.com', 'South Florida', true),
  ('player2@example.com', 'Tampa Bay', true),
  ('player3@example.com', 'Central Florida', true),
  ('player4@example.com', NULL, true),
  ('player5@example.com', 'Panhandle', true);
