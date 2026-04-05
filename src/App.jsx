import { useState, useMemo, useEffect } from 'react'
import './App.css'

// ─────────────────────────────────────────────
//  FILTER OPTIONS  ← edit here to add more choices
// ─────────────────────────────────────────────
const CAUSE_AREAS     = ['All', 'Environment', 'Education', 'Health', 'Animals', 'Community', 'Elderly']
const BACKGROUNDS     = ['All', 'High School', 'Undergraduate', 'Graduate', 'Professional', 'Retired']
const ALL_SKILLS      = ['Communication', 'Social Media', 'Teaching', 'Coding', 'Fundraising', 'Event Planning']
const ALL_AVAILABILITY = ['Weekday Afternoons', 'Weekday Evenings', 'Weekends', 'Fully Flexible']
const LANGUAGES       = ['All', 'English', 'Spanish', 'Mandarin', 'French']
const LOCATIONS       = ['All', 'Remote', 'In-person']

const CAUSE_OPTIONS = CAUSE_AREAS.filter((c) => c !== 'All')
const BACKGROUND_OPTIONS = BACKGROUNDS.filter((b) => b !== 'All')
const LANGUAGE_OPTIONS = LANGUAGES.filter((l) => l !== 'All')
const LOCATION_OPTIONS = LOCATIONS.filter((l) => l !== 'All')

// Cause area badge colors
const CAUSE_COLORS = {
  Environment: 'bg-green-100 text-green-700',
  Education:   'bg-blue-100  text-blue-700',
  Health:      'bg-red-100   text-red-700',
  Animals:     'bg-orange-100 text-orange-700',
  Community:   'bg-purple-100 text-purple-700',
  Elderly:     'bg-amber-100 text-amber-800',
}

// ─────────────────────────────────────────────
//  MOCK VOLUNTEER ROLES  ← edit here to change role cards
//  SPECIFIC_ROLES = curated postings. FLEX_GENERALIST_ROLES = one per cause, open on
//  background/language/location with every skill & availability slot so
//  virtually all valid form combinations still get ≥1 match (≥80% coverage goal).
// ─────────────────────────────────────────────
const SPECIFIC_ROLES = [
  {
    id: 1,
    title: 'Community Outreach Coordinator',
    org: 'Green Earth Foundation',
    causeArea: 'Environment',
    background: 'Undergraduate',
    skills: ['Communication', 'Social Media'],
    skillRates: { Communication: 0.4, 'Social Media': 0.6 },
    availability: ['Weekday Evenings', 'Fully Flexible'],
    availabilityRates: { 'Weekday Evenings': 0.35, 'Fully Flexible': 0.65 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Spread awareness about local recycling programs and engage with community members online.',
    icon: '🌱',
  },
  {
    id: 2,
    title: 'After-School Tutor',
    org: 'Bright Futures Academy',
    causeArea: 'Education',
    background: 'High School',
    skills: ['Teaching', 'Communication'],
    skillRates: { Teaching: 0.8, Communication: 0.2 },
    availability: ['Weekday Afternoons'],
    availabilityRates: { 'Weekday Afternoons': 1 },
    language: 'English',
    location: 'In-person',
    population: 'Children',
    description: 'Support K-8 students with homework and reading in a downtown after-school program.',
    icon: '📚',
  },
  {
    id: 3,
    title: 'Volunteer Web Developer',
    org: 'Animal Rescue Alliance',
    causeArea: 'Animals',
    background: 'Professional',
    skills: ['Coding', 'Social Media'],
    skillRates: { Coding: 0.85, 'Social Media': 0.15 },
    availability: ['Fully Flexible'],
    availabilityRates: { 'Fully Flexible': 1 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Build and maintain our pet adoption portal so more animals can find loving homes.',
    icon: '🐾',
  },
  {
    id: 4,
    title: 'Health Fair Organizer',
    org: 'Community Wellness Collective',
    causeArea: 'Health',
    background: 'Professional',
    skills: ['Event Planning', 'Communication'],
    skillRates: { 'Event Planning': 0.7, Communication: 0.3 },
    availability: ['Weekends'],
    availabilityRates: { Weekends: 1 },
    language: 'Spanish',
    location: 'In-person',
    population: 'General Public',
    description: 'Coordinate free health screenings and wellness workshops for underserved families.',
    icon: '❤️',
  },
  {
    id: 5,
    title: 'Fundraising Campaign Lead',
    org: 'Education Without Borders',
    causeArea: 'Education',
    background: 'Professional',
    skills: ['Fundraising', 'Communication'],
    skillRates: { Fundraising: 0.75, Communication: 0.25 },
    availability: ['Weekday Evenings', 'Fully Flexible'],
    availabilityRates: { 'Weekday Evenings': 0.4, 'Fully Flexible': 0.6 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Run online fundraising drives to provide school supplies to children in need.',
    icon: '✏️',
  },
  {
    id: 6,
    title: 'Social Media Manager',
    org: 'Urban Community Gardens',
    causeArea: 'Community',
    background: 'Graduate',
    skills: ['Social Media', 'Communication'],
    skillRates: { 'Social Media': 0.8, Communication: 0.2 },
    availability: ['Fully Flexible'],
    availabilityRates: { 'Fully Flexible': 1 },
    language: 'Mandarin',
    location: 'Remote',
    population: 'General Public',
    description: 'Grow our online presence and connect local gardeners through engaging content.',
    icon: '🌿',
  },
  {
    id: 7,
    title: 'Food Bank Weekend Volunteer',
    org: 'City Harvest Network',
    causeArea: 'Community',
    background: 'Retired',
    skills: ['Event Planning', 'Communication'],
    skillRates: { 'Event Planning': 0.65, Communication: 0.35 },
    availability: ['Weekends'],
    // Example: weekend-only need — offering only weekends is enough for full availability credit.
    availabilityRates: { Weekends: 1, 'Weekday Afternoons': 0.2, 'Weekday Evenings': 0.2, 'Fully Flexible': 1 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Help sort, pack, and distribute food to families facing food insecurity every weekend.',
    icon: '🍎',
  },
  {
    id: 8,
    title: 'Data & Impact Analyst',
    org: 'Health Access Initiative',
    causeArea: 'Health',
    background: 'Professional',
    skills: ['Coding', 'Fundraising'],
    skillRates: { Coding: 0.85, Fundraising: 0.15 },
    availability: ['Weekday Evenings', 'Weekends', 'Fully Flexible'],
    // Wider schedule need: one slot partial; weekday + weekend higher; fully flexible = full.
    availabilityRates: { 'Weekday Afternoons': 0.15, 'Weekday Evenings': 0.35, Weekends: 0.35, 'Fully Flexible': 1 },
    language: 'French',
    location: 'Remote',
    population: 'Seniors',
    description: 'Analyze program data to demonstrate impact to donors and help improve our services.',
    icon: '📊',
  },
  {
    id: 9,
    title: 'Senior Phone Companion',
    org: 'Silver Linings Collective',
    causeArea: 'Elderly',
    background: 'Retired',
    skills: ['Communication', 'Teaching'],
    skillRates: { Communication: 0.55, Teaching: 0.45 },
    availability: ['Weekday Afternoons', 'Weekday Evenings', 'Fully Flexible'],
    availabilityRates: { 'Weekday Afternoons': 0.35, 'Weekday Evenings': 0.45, Weekends: 0.2, 'Fully Flexible': 1 },
    language: 'English',
    location: 'Remote',
    population: 'Seniors',
    description: 'Friendly weekly calls with older adults who live alone — listen, chat, and flag concerns to staff.',
    icon: '☎️',
  },
  {
    id: 10,
    title: 'Park Restoration Volunteer',
    org: 'Riverfront Conservation Corps',
    causeArea: 'Environment',
    background: 'High School',
    skills: ['Event Planning', 'Communication'],
    skillRates: { 'Event Planning': 0.5, Communication: 0.5 },
    availability: ['Weekends', 'Weekday Evenings'],
    availabilityRates: { Weekends: 0.7, 'Weekday Evenings': 0.45, 'Fully Flexible': 1, 'Weekday Afternoons': 0.15 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Help with native planting days and trail cleanups alongside other community volunteers.',
    icon: '🌲',
  },
  {
    id: 11,
    title: 'ESL Conversation Partner',
    org: 'New Neighbors Project',
    causeArea: 'Community',
    background: 'Undergraduate',
    skills: ['Teaching', 'Communication'],
    skillRates: { Teaching: 0.35, Communication: 0.65 },
    availability: ['Weekday Evenings', 'Weekends'],
    availabilityRates: { 'Weekday Evenings': 0.55, Weekends: 0.5, 'Fully Flexible': 1, 'Weekday Afternoons': 0.25 },
    language: 'Spanish',
    location: 'In-person',
    population: 'General Public',
    description: 'Practice English in small groups with newcomers over coffee — curriculum provided.',
    icon: '🗣️',
  },
  {
    id: 12,
    title: 'Shelter Adoption Event Host',
    org: 'Second Chance Animal Shelter',
    causeArea: 'Animals',
    background: 'Professional',
    skills: ['Event Planning', 'Fundraising'],
    skillRates: { 'Event Planning': 0.6, Fundraising: 0.4 },
    availability: ['Weekends', 'Fully Flexible'],
    availabilityRates: { Weekends: 0.85, 'Fully Flexible': 1, 'Weekday Evenings': 0.3 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Run weekend adoption booths, handle sign-ups, and share stories that help pets find homes.',
    icon: '🐕',
  },
  {
    id: 13,
    title: 'Hospital Wayfinding Volunteer',
    org: 'Metro General Hospital',
    causeArea: 'Health',
    background: 'Retired',
    skills: ['Communication', 'Teaching'],
    skillRates: { Communication: 0.85, Teaching: 0.15 },
    availability: ['Weekday Afternoons', 'Weekday Evenings'],
    availabilityRates: { 'Weekday Afternoons': 0.5, 'Weekday Evenings': 0.5, Weekends: 0.35, 'Fully Flexible': 1 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Greet visitors, escort families to clinics, and keep our front desk calm during busy hours.',
    icon: '🏥',
  },
  {
    id: 14,
    title: 'Youth Coding Club Mentor',
    org: 'Byte Forward',
    causeArea: 'Education',
    background: 'Professional',
    skills: ['Coding', 'Teaching'],
    skillRates: { Coding: 0.7, Teaching: 0.3 },
    availability: ['Weekday Evenings', 'Weekends'],
    availabilityRates: { 'Weekday Evenings': 0.6, Weekends: 0.55, 'Fully Flexible': 1 },
    language: 'English',
    location: 'In-person',
    population: 'Children',
    description: 'Guide middle schoolers through Scratch and simple web projects in a library lab setting.',
    icon: '💻',
  },
  {
    id: 15,
    title: 'Grant Writing Volunteer',
    org: 'Hope Housing Cooperative',
    causeArea: 'Community',
    background: 'Graduate',
    skills: ['Fundraising', 'Communication'],
    skillRates: { Fundraising: 0.55, Communication: 0.45 },
    availability: ['Weekday Evenings', 'Fully Flexible'],
    availabilityRates: { 'Weekday Evenings': 0.5, 'Fully Flexible': 1, Weekends: 0.25 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Draft and edit grant narratives with our programs team — strong writing beats nonprofit experience.',
    icon: '📝',
  },
  {
    id: 16,
    title: 'Community Garden Lead',
    org: 'Roots in the City',
    causeArea: 'Community',
    background: 'Professional',
    skills: ['Teaching', 'Event Planning'],
    skillRates: { Teaching: 0.4, 'Event Planning': 0.6 },
    availability: ['Weekends', 'Weekday Evenings', 'Fully Flexible'],
    availabilityRates: { Weekends: 0.55, 'Weekday Evenings': 0.35, 'Fully Flexible': 1, 'Weekday Afternoons': 0.2 },
    language: 'Mandarin',
    location: 'In-person',
    population: 'General Public',
    description: 'Teach raised-bed workshops and organize seasonal harvest days for neighborhood families.',
    icon: '🥕',
  },
  {
    id: 17,
    title: 'Crisis Text Line Coach',
    org: 'Nightlight Support Network',
    causeArea: 'Health',
    background: 'Graduate',
    skills: ['Communication', 'Teaching'],
    skillRates: { Communication: 0.7, Teaching: 0.3 },
    availability: ['Weekday Evenings', 'Weekends', 'Fully Flexible'],
    availabilityRates: { 'Weekday Evenings': 0.4, Weekends: 0.45, 'Fully Flexible': 1, 'Weekday Afternoons': 0.25 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Complete training then cover remote shifts supporting texters in distress — supervision on call.',
    icon: '💬',
  },
  {
    id: 18,
    title: 'Wildlife Survey Field Assistant',
    org: 'Pacific Species Watch',
    causeArea: 'Animals',
    background: 'Undergraduate',
    skills: ['Coding', 'Communication'],
    skillRates: { Coding: 0.5, Communication: 0.5 },
    availability: ['Weekends', 'Weekday Afternoons'],
    availabilityRates: { Weekends: 0.75, 'Weekday Afternoons': 0.4, 'Fully Flexible': 1, 'Weekday Evenings': 0.2 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Collect field notes and photos; help log sightings in our citizen science app.',
    icon: '🔭',
  },
  {
    id: 19,
    title: 'Music & Movement Assistant',
    org: 'Harmony Kids Foundation',
    causeArea: 'Education',
    background: 'Undergraduate',
    skills: ['Teaching', 'Communication'],
    skillRates: { Teaching: 0.45, Communication: 0.55 },
    availability: ['Weekday Afternoons', 'Weekends'],
    availabilityRates: { 'Weekday Afternoons': 0.55, Weekends: 0.5, 'Fully Flexible': 1, 'Weekday Evenings': 0.3 },
    language: 'English',
    location: 'In-person',
    population: 'Children',
    description: 'Help lead short music games and movement breaks for elementary classes — no instrument required.',
    icon: '🎵',
  },
  {
    id: 20,
    title: 'Coastal Cleanup Crew Lead',
    org: 'Blue Horizon Alliance',
    causeArea: 'Environment',
    background: 'Professional',
    skills: ['Event Planning', 'Communication'],
    skillRates: { 'Event Planning': 0.65, Communication: 0.35 },
    availability: ['Weekends'],
    availabilityRates: { Weekends: 1, 'Weekday Evenings': 0.25, 'Fully Flexible': 1 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Register volunteers, hand out supplies, and keep monthly shoreline cleanups on schedule.',
    icon: '🌊',
  },
  {
    id: 21,
    title: 'Vaccine Clinic Greeter',
    org: 'Public Health Partners',
    causeArea: 'Health',
    background: 'High School',
    skills: ['Communication', 'Teaching'],
    skillRates: { Communication: 0.75, Teaching: 0.25 },
    availability: ['Weekends', 'Weekday Evenings'],
    availabilityRates: { Weekends: 0.55, 'Weekday Evenings': 0.5, 'Fully Flexible': 1, 'Weekday Afternoons': 0.35 },
    language: 'Spanish',
    location: 'In-person',
    population: 'General Public',
    description: 'Welcome patients, manage lines, and explain simple forms at pop-up immunization sites.',
    icon: '💉',
  },
  {
    id: 22,
    title: 'Adult Literacy Tutor',
    org: 'Open Book Collective',
    causeArea: 'Education',
    background: 'Retired',
    skills: ['Teaching', 'Communication'],
    skillRates: { Teaching: 0.7, Communication: 0.3 },
    availability: ['Weekday Evenings', 'Fully Flexible'],
    availabilityRates: { 'Weekday Evenings': 0.55, 'Fully Flexible': 1, Weekends: 0.35 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'One-on-one reading sessions with adults building literacy — materials and training provided.',
    icon: '📖',
  },
  {
    id: 23,
    title: 'Foster Home Coordinator',
    org: 'Whiskers & Wags Rescue',
    causeArea: 'Animals',
    background: 'Professional',
    skills: ['Communication', 'Fundraising'],
    skillRates: { Communication: 0.5, Fundraising: 0.5 },
    availability: ['Weekday Evenings', 'Weekends', 'Fully Flexible'],
    availabilityRates: { 'Weekday Evenings': 0.4, Weekends: 0.45, 'Fully Flexible': 1 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Screen foster applicants by phone and email; track placements in our shared spreadsheet.',
    icon: '🏠',
  },
  {
    id: 24,
    title: 'Digital Skills Buddy (Seniors)',
    org: 'Connect Generations',
    causeArea: 'Elderly',
    background: 'Undergraduate',
    skills: ['Teaching', 'Communication'],
    skillRates: { Teaching: 0.5, Communication: 0.5 },
    availability: ['Weekday Afternoons', 'Weekends'],
    availabilityRates: { 'Weekday Afternoons': 0.45, Weekends: 0.55, 'Fully Flexible': 1, 'Weekday Evenings': 0.35 },
    language: 'English',
    location: 'In-person',
    population: 'Seniors',
    description: 'Patience-first help with phones, video calls, and safe browsing at a senior center lab.',
    icon: '📱',
  },
  {
    id: 25,
    title: 'Monthly Newsletter Editor',
    org: 'Downtown Arts Guild',
    causeArea: 'Community',
    background: 'Graduate',
    skills: ['Communication', 'Social Media'],
    skillRates: { Communication: 0.55, 'Social Media': 0.45 },
    availability: ['Fully Flexible'],
    availabilityRates: { 'Fully Flexible': 1, 'Weekday Evenings': 0.45 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Compile member stories and events into a clean Mailchimp send once a month.',
    icon: '📧',
  },
  {
    id: 26,
    title: 'Board Meeting Facilitator',
    org: 'Neighbors for Fair Housing',
    causeArea: 'Community',
    background: 'Professional',
    skills: ['Event Planning', 'Communication'],
    skillRates: { 'Event Planning': 0.55, Communication: 0.45 },
    availability: ['Weekday Evenings'],
    availabilityRates: { 'Weekday Evenings': 1, 'Fully Flexible': 0.85, Weekends: 0.2 },
    language: 'English',
    location: 'Remote',
    population: 'General Public',
    description: 'Run Zoom agendas, timekeeping, and follow-up notes for a working board of twelve.',
    icon: '📋',
  },
  {
    id: 27,
    title: 'Community Soup Kitchen Server',
    org: 'Warm Bowl Kitchen',
    causeArea: 'Community',
    background: 'High School',
    skills: ['Communication', 'Event Planning'],
    skillRates: { Communication: 0.6, 'Event Planning': 0.4 },
    availability: ['Weekends', 'Weekday Evenings'],
    availabilityRates: { Weekends: 0.65, 'Weekday Evenings': 0.45, 'Fully Flexible': 1 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Serve meals, bus tables, and welcome guests with dignity during dinner rush.',
    icon: '🍲',
  },
  {
    id: 28,
    title: 'Urban Tree Steward',
    org: 'Canopy Builders',
    causeArea: 'Environment',
    background: 'Undergraduate',
    skills: ['Fundraising', 'Event Planning'],
    skillRates: { Fundraising: 0.45, 'Event Planning': 0.55 },
    availability: ['Weekends', 'Weekday Afternoons'],
    availabilityRates: { Weekends: 0.7, 'Weekday Afternoons': 0.35, 'Fully Flexible': 1 },
    language: 'English',
    location: 'In-person',
    population: 'General Public',
    description: 'Help organize sapling giveaways and track volunteer hours for city planting grants.',
    icon: '🌳',
  },
  {
    id: 29,
    title: 'Blood Drive Registration Desk',
    org: 'LifeLink Blood Center',
    causeArea: 'Health',
    background: 'Undergraduate',
    skills: ['Communication', 'Event Planning'],
    skillRates: { Communication: 0.65, 'Event Planning': 0.35 },
    availability: ['Weekday Afternoons', 'Weekends'],
    availabilityRates: { 'Weekday Afternoons': 0.5, Weekends: 0.55, 'Fully Flexible': 1 },
    language: 'French',
    location: 'In-person',
    population: 'General Public',
    description: 'Check IDs, hand out snacks, and keep donor flow smooth at mobile collection sites.',
    icon: '🩸',
  },
  {
    id: 30,
    title: 'Peer Language Exchange Host',
    org: 'Global Café Network',
    causeArea: 'Community',
    background: 'Graduate',
    skills: ['Communication', 'Teaching'],
    skillRates: { Communication: 0.6, Teaching: 0.4 },
    availability: ['Weekday Evenings', 'Weekends', 'Fully Flexible'],
    availabilityRates: { 'Weekday Evenings': 0.45, Weekends: 0.4, 'Fully Flexible': 1, 'Weekday Afternoons': 0.2 },
    language: 'Mandarin',
    location: 'In-person',
    population: 'General Public',
    description: 'Host small mixed-language tables at a weekly café — icebreakers and prompts provided.',
    icon: '☕',
  },
]

const FLEX_SKILL_RATES = Object.fromEntries(ALL_SKILLS.map((s) => [s, 1 / ALL_SKILLS.length]))
const FLEX_AVAIL_RATES = Object.fromEntries(ALL_AVAILABILITY.map((a) => [a, 1 / ALL_AVAILABILITY.length]))
const FLEX_ICONS = {
  Environment: '🌍',
  Education: '🎓',
  Health: '🏥',
  Animals: '🐾',
  Community: '🤝',
  Elderly: '💛',
}

const FLEX_GENERALIST_ROLES = CAUSE_OPTIONS.map((cause, i) => ({
  id: 200 + i,
  title: `${cause} — Open volunteer pool`,
  org: 'Handraise Community Match',
  causeArea: cause,
  matchAnyBackground: true,
  matchAnyLanguage: true,
  matchAnyLocation: true,
  background: 'Professional',
  language: 'English',
  location: 'Remote',
  population: 'General Public',
  skills: [...ALL_SKILLS],
  skillRates: FLEX_SKILL_RATES,
  availability: [...ALL_AVAILABILITY],
  availabilityRates: FLEX_AVAIL_RATES,
  description:
    'Flexible placement with partner nonprofits in this cause area. Your background, language, and location preferences still influence your match score.',
  icon: FLEX_ICONS[cause] ?? '🤲',
}))

const ROLES = [...SPECIFIC_ROLES, ...FLEX_GENERALIST_ROLES]

// ─────────────────────────────────────────────
//  MATCH SCORE — category weights (must sum to 1)
//  Only categories the user actually filters on are included; the score is
//  the weighted average of match quality (0–1) on those categories, scaled to 0–100.
//  Multi-select (skills, availability): per-role *Rates maps — sum of rates for
//  each option the volunteer selected, capped at 1. Tune rates per role (e.g. weekend-
//  only roles can set Weekends: 1 so one weekend tick gives full availability credit).
//  Single-select: quality is 1 if role matches, else 0.
// ─────────────────────────────────────────────
// Renormalized after removing population (was 10% of bar)
const _MATCH_W = 1 / 0.9
const MATCH_CATEGORY_WEIGHTS = {
  causeArea: 0.15 * _MATCH_W,
  background: 0.1 * _MATCH_W,
  skills: 0.25 * _MATCH_W,
  availability: 0.2 * _MATCH_W,
  language: 0.1 * _MATCH_W,
  location: 0.1 * _MATCH_W,
}

function qualityFromRates(role, selected, ratesKey, fallbackListKey) {
  if (selected.length === 0) return 0
  const rates = role[ratesKey]
  if (!rates) {
    const arr = role[fallbackListKey] || []
    const n = arr.length
    const per = n > 0 ? 1 / n : 0
    const raw = selected.reduce((sum, s) => sum + (arr.includes(s) ? per : 0), 0)
    return Math.min(1, raw)
  }
  const raw = selected.reduce((sum, s) => sum + (rates[s] ?? 0), 0)
  return Math.min(1, raw)
}

function skillScoreFromRates(role, selectedSkills) {
  return qualityFromRates(role, selectedSkills, 'skillRates', 'skills')
}

function availabilityScoreFromRates(role, selectedAvailability) {
  return qualityFromRates(role, selectedAvailability, 'availabilityRates', 'availability')
}

function calcScore(role, { causeArea, background, selectedSkills, selectedAvailability, language, location }) {
  const parts = []

  if (causeArea !== 'All' && causeArea) {
    const ok = role.matchAnyCause || role.causeArea === causeArea
    parts.push([MATCH_CATEGORY_WEIGHTS.causeArea, ok ? 1 : 0])
  }
  if (background !== 'All' && background) {
    const ok = role.matchAnyBackground || role.background === background
    parts.push([MATCH_CATEGORY_WEIGHTS.background, ok ? 1 : 0])
  }
  if (selectedSkills.length > 0) {
    parts.push([MATCH_CATEGORY_WEIGHTS.skills, skillScoreFromRates(role, selectedSkills)])
  }
  if (selectedAvailability.length > 0) {
    parts.push([
      MATCH_CATEGORY_WEIGHTS.availability,
      availabilityScoreFromRates(role, selectedAvailability),
    ])
  }
  if (language !== 'All' && language) {
    const ok = role.matchAnyLanguage || role.language === language
    parts.push([MATCH_CATEGORY_WEIGHTS.language, ok ? 1 : 0])
  }
  if (location !== 'All' && location) {
    const ok = role.matchAnyLocation || role.location === location
    parts.push([MATCH_CATEGORY_WEIGHTS.location, ok ? 1 : 0])
  }

  if (parts.length === 0) return null

  const weightSum = parts.reduce((s, [w]) => s + w, 0)
  const weighted = parts.reduce((s, [w, q]) => s + w * q, 0)
  return Math.round((weighted / weightSum) * 100)
}


function RoleCard({ role, score }) {
  const scoreColor =
    score === null  ? { bg: 'bg-gray-100',    text: 'text-gray-400',    ring: 'ring-gray-200' }
    : score >= 80   ? { bg: 'bg-green-50',    text: 'text-green-700',   ring: 'ring-green-200' }
    : score >= 50   ? { bg: 'bg-amber-50',    text: 'text-amber-700',   ring: 'ring-amber-200' }
    :                 { bg: 'bg-gray-50',      text: 'text-gray-400',    ring: 'ring-gray-100' }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">

      {/* Top accent bar — colour-coded by cause */}
      <div className={`h-1 w-full ${
        role.causeArea === 'Environment' ? 'bg-green-400'
        : role.causeArea === 'Education' ? 'bg-blue-400'
        : role.causeArea === 'Health'    ? 'bg-red-400'
        : role.causeArea === 'Animals'   ? 'bg-orange-400'
        : role.causeArea === 'Community' ? 'bg-purple-400'
        : role.causeArea === 'Elderly'   ? 'bg-amber-400'
        : 'bg-gray-300'
      }`} />

      <div className="p-6 flex flex-col flex-1">

        {/* Row 1: icon + title + score */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0">
            {role.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 text-base leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                {role.title}
              </h3>
              {score !== null && (
                <div className={`shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl ring-1 ${scoreColor.bg} ${scoreColor.ring}`}>
                  <span className={`text-base font-bold leading-none ${scoreColor.text}`}>{score}</span>
                  <span className={`text-[10px] font-medium ${scoreColor.text} opacity-70`}>match</span>
                </div>
              )}
            </div>
            <p className="text-blue-500 text-sm mt-0.5 truncate">{role.org}</p>
          </div>
        </div>

        {/* Row 2: flexible pool badge */}
        {(role.matchAnyBackground || role.matchAnyLanguage || role.matchAnyLocation) && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-600 border border-violet-100 text-xs font-semibold px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Flexible pool
            </span>
          </div>
        )}

        {/* Row 3: description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1">{role.description}</p>

        {/* Row 4: meta details */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="text-gray-300">👤</span>
            {role.matchAnyBackground ? 'Any background' : role.background}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-gray-300">🌐</span>
            {role.matchAnyLanguage ? 'Any language' : role.language}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-gray-300">📍</span>
            {role.matchAnyLocation ? 'Any location' : role.location}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-gray-300">🤝</span>
            {role.population}
          </span>
        </div>

        {/* Row 5: availability */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {role.availability.map((a) => (
            <span key={a} className="bg-green-50 text-green-700 border border-green-100 text-xs font-medium px-2.5 py-1 rounded-lg">
              {a}
            </span>
          ))}
        </div>

        {/* Row 6: cause + skill tags */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${CAUSE_COLORS[role.causeArea] ?? 'bg-gray-100 text-gray-600'}`}>
            {role.causeArea}
          </span>
          {role.skills.map((skill) => (
            <span key={skill} className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-lg">
              {skill}
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  PILL BUTTON (reusable toggle button)
// ─────────────────────────────────────────────
function PillButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-base font-semibold border transition-colors ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
      }`}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────
function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
    >
      {children}
    </div>
  )
}

// Handraise logo mark — redrawn to match reference: ring + raised-hand + up-arrow
function HandraiseMark({ size = 36, onDark = true }) {
  const id = onDark ? 'dark' : 'light'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Ring gradient */}
        <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={onDark ? '#60a5fa' : '#1d4ed8'} />
          <stop offset="100%" stopColor={onDark ? '#0ea5e9' : '#0369a1'} />
        </linearGradient>
        {/* Icon fill gradient */}
        <linearGradient id={`icon-${id}`} x1="24" y1="12" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={onDark ? '#93c5fd' : '#2563eb'} />
          <stop offset="100%" stopColor={onDark ? '#3b82f6' : '#1e40af'} />
        </linearGradient>
        {/* Arrow gradient */}
        <linearGradient id={`arrow-${id}`} x1="24" y1="10" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={onDark ? '#e0f2fe' : '#dbeafe'} />
          <stop offset="100%" stopColor={onDark ? '#7dd3fc' : '#60a5fa'} />
        </linearGradient>
        {/* Inner circle subtle fill */}
        <radialGradient id={`bg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={onDark ? '#0f172a' : '#eff6ff'} stopOpacity="0.7" />
          <stop offset="100%" stopColor={onDark ? '#0c1a2e' : '#dbeafe'} stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke={`url(#ring-${id})`} strokeWidth="2.5" fill={`url(#bg-${id})`} />

      {/* Left pillar (finger) */}
      <rect x="11" y="21" width="6" height="15" rx="3" fill={`url(#icon-${id})`} />
      {/* Right pillar (finger) */}
      <rect x="31" y="21" width="6" height="15" rx="3" fill={`url(#icon-${id})`} />
      {/* Palm — with V notch: two trapezoid-like halves connected */}
      <path
        d="M14 32 L14 36 Q14 38 17 38 L31 38 Q34 38 34 36 L34 32 L28 32 L25.5 35 L22.5 35 L20 32 Z"
        fill={`url(#icon-${id})`}
      />
      {/* Chevron accent on palm */}
      <path d="M20 31.5 L24 28 L28 31.5" stroke={onDark ? '#38bdf8' : '#0ea5e9'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Arrow shaft */}
      <line x1="24" y1="26" x2="24" y2="14" stroke={`url(#arrow-${id})`} strokeWidth="2.8" strokeLinecap="round" />
      {/* Arrow head */}
      <path d="M19 19 L24 13 L29 19" stroke={`url(#arrow-${id})`} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// Logo lockup: mark + wordmark
function HandraiseLogo({ size = 36, textClass = 'text-white', onDark = true }) {
  return (
    <div className="flex items-center gap-1">
      <img
        src="/assets/logo.png"
        alt="Handraise mark"
        width={size * 1.15}
        height={size * 1.15}
        style={{
          objectFit: 'contain',
          filter: onDark
            ? 'brightness(0) invert(1) drop-shadow(0 0 0 #60a5fa)'
            : 'none',
        }}
      />
      <span
        className={`font-medium leading-none ${textClass}`}
        style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.58, letterSpacing: '-0.01em', marginLeft: `-${size * 0.18}px`, marginTop: `${size * 0.12}px` }}
      >
        Handraise
      </span>
    </div>
  )
}

function TitlePage({ onGetStarted }) {
  return (
    <div className="bg-[#050c18] text-white">

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* BG image — bright and crisp */}
        <div
          className="absolute inset-0 opacity-65"
          style={{
            backgroundImage: 'url(/assets/bg-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 28%',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(1.25) contrast(1.1) saturate(1.1)',
          }}
        />
        {/* Gradient: image fully visible top-centre, dark layer only at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(5,12,24,0.05) 0%, rgba(5,12,24,0.25) 40%, rgba(5,12,24,0.88) 68%, #050c18 84%)',
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 px-8 py-7">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <HandraiseLogo size={52} textClass="text-white" />
            <div className="flex items-center gap-8">
              <span className="hidden sm:inline text-sm font-normal text-white/35 tracking-widest uppercase">Built with SAP</span>
              <button
                onClick={onGetStarted}
                className="text-base font-semibold bg-white/10 hover:bg-white/18 border border-white/20 hover:border-white/35 px-6 py-2.5 rounded-xl transition-all"
              >
                Get Started &rarr;
              </button>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-10">
          <div className="max-w-4xl text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-blue-500/20 border border-blue-400/35 rounded-full px-6 py-2.5 mb-10">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-base font-medium text-blue-200 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Smarter matching for small nonprofits</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium leading-[1.1] mb-8 tracking-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              The right volunteer<br />
              for the right role,{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                faster
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-white/75 max-w-3xl mx-auto mb-14 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>
              Handraise helps small nonprofits match volunteers by fit, flexibility,
              and onboarding readiness — so the right people start in the right roles,
              without the usual back-and-forth.
            </p>

            {/* CTA */}
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xl px-14 py-5 rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/35 transition-all active:scale-[0.97]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Find Your Match
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-white/40 text-base mt-5" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>No account needed — takes under 2 minutes</p>

          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 pb-10 flex justify-center">
          <div className="w-6 h-9 rounded-full border-2 border-white/25 flex justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      {/* ═══ WHAT MAKES HANDRAISE DIFFERENT ═══ */}
      <section className="px-8 py-28">
        <div className="max-w-6xl mx-auto">

          <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4 text-center" style={{ fontFamily: 'var(--font-display)' }}>Why Handraise</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-5" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Not just another sign-up form
          </h2>
          <p className="text-white/55 text-xl text-center max-w-2xl mx-auto mb-20 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>
            Most volunteer platforms collect names. Handraise helps nonprofits
            find people who actually fit — and helps volunteers start faster.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <GlassCard className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl mb-6">
                🎯
              </div>
              <h3 className="font-medium text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>Match Score + Why This Match</h3>
              <p className="text-base text-white/55 leading-relaxed">
                Every role shows a transparent percentage score so volunteers
                understand why it fits — skills, schedule overlap, background,
                and more — not just a random list.
              </p>
            </GlassCard>

            <GlassCard className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-3xl mb-6">
                ⏱️
              </div>
              <h3 className="font-medium text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>Flexible Commitment Options</h3>
              <p className="text-base text-white/55 leading-relaxed">
                Filter by weekday evenings, weekends only, or fully flexible.
                Roles adapt to real-life schedules so volunteers can contribute
                without overcommitting.
              </p>
            </GlassCard>

            <GlassCard className="p-8">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-3xl mb-6">
                🚀
              </div>
              <h3 className="font-medium text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>Quick-Start Onboarding</h3>
              <p className="text-base text-white/55 leading-relaxed">
                Each match comes with role context, org info, and the details
                you need to hit the ground running — reducing the back-and-forth
                that stalls most volunteer pipelines.
              </p>
            </GlassCard>

          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-8 py-28 border-t border-white/8">
        <div className="max-w-5xl mx-auto">

          <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4 text-center" style={{ fontFamily: 'var(--font-display)' }}>How it works</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-center mb-20" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Three steps to your best-fit role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Share your profile',
                desc: 'Pick your cause area, background, skills, availability, language, and location preference.',
              },
              {
                step: '02',
                title: 'See ranked matches',
                desc: 'Handraise scores every role on fit and shows your top matches — highest confidence first.',
              },
              {
                step: '03',
                title: 'Start with context',
                desc: 'Each card gives you the org, schedule, and role details you need to reach out and begin.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center md:text-left">
                <div className="text-4xl font-medium text-blue-500/25 mb-4 leading-none" style={{ fontFamily: 'var(--font-display)' }}>{item.step}</div>
                <h3 className="font-medium text-xl mb-3" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                <p className="text-base text-white/55 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-20">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xl px-14 py-5 rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-400/30 transition-all active:scale-[0.97]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Find Your Match
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="px-8 py-20 border-t border-white/8">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '30+', label: 'Curated Roles' },
            { value: '6', label: 'Cause Areas' },
            { value: '<2 min', label: 'To Get Matches' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-5xl font-medium bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {s.value}
              </div>
              <div className="text-lg text-white/60 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-8 py-10 border-t border-white/8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <HandraiseLogo size={40} textClass="text-white/40" onDark={true} />
          <p className="text-sm text-white/30 text-center font-light">
            &copy; {new Date().getFullYear()} Handraise &mdash; A volunteer matching tool built with SAP.
          </p>
        </div>
      </footer>

    </div>
  )
}

function App() {
  const [page, setPage] = useState('title')
  const [causeArea,            setCauseArea]            = useState('')
  const [background,           setBackground]           = useState('')
  const [selectedSkills,       setSelectedSkills]       = useState([])
  const [selectedAvailability, setSelectedAvailability] = useState([])
  const [language,             setLanguage]             = useState('')
  const [location,             setLocation]             = useState('')
  const [submittedFilterKey, setSubmittedFilterKey] = useState(null)

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        causeArea,
        background,
        language,
        location,
        skills: [...selectedSkills].sort(),
        avail: [...selectedAvailability].sort(),
      }),
    [causeArea, background, selectedSkills, selectedAvailability, language, location]
  )

  const formComplete =
    causeArea !== '' &&
    background !== '' &&
    selectedSkills.length > 0 &&
    selectedAvailability.length > 0 &&
    language !== '' &&
    location !== ''

  function toggleSkill(skill) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  function toggleAvailability(slot) {
    setSelectedAvailability((prev) =>
      prev.includes(slot) ? prev.filter((a) => a !== slot) : [...prev, slot]
    )
  }

  const filters = useMemo(
    () => ({ causeArea, background, selectedSkills, selectedAvailability, language, location }),
    [causeArea, background, selectedSkills, selectedAvailability, language, location]
  )

  useEffect(() => {
    setSubmittedFilterKey(null)
  }, [filterKey])

  const showResults = formComplete && submittedFilterKey !== null && submittedFilterKey === filterKey

  const matches = useMemo(() => {
    if (!showResults) return []
    const { causeArea: c, background: bg, selectedSkills: sk, selectedAvailability: av, language: lang, location: loc } = filters
    return ROLES
      .filter((role) => {
        const causeMatch = role.matchAnyCause || role.causeArea === c
        const bgMatch = role.matchAnyBackground || role.background === bg
        const skillMatch = sk.some((s) => role.skills.includes(s))
        const availMatch = av.some((a) => role.availability.includes(a))
        const langMatch = role.matchAnyLanguage || role.language === lang
        const locMatch = role.matchAnyLocation || role.location === loc
        return causeMatch && bgMatch && skillMatch && availMatch && langMatch && locMatch
      })
      .map((role) => ({ ...role, score: calcScore(role, filters) }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }, [showResults, filters])

  const hasStarted =
    causeArea !== '' ||
    background !== '' ||
    selectedSkills.length > 0 ||
    selectedAvailability.length > 0 ||
    language !== '' ||
    location !== ''

  const activeFilterLabels = [
    causeArea || null,
    background || null,
    language || null,
    location || null,
    ...selectedSkills,
    ...selectedAvailability,
  ].filter(Boolean)

  function resetForm() {
    setCauseArea('')
    setBackground('')
    setSelectedSkills([])
    setSelectedAvailability([])
    setLanguage('')
    setLocation('')
    setSubmittedFilterKey(null)
  }

  function handleFinish() {
    if (!formComplete) return
    setSubmittedFilterKey(filterKey)
    requestAnimationFrame(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  if (page === 'title') {
    return <TitlePage onGetStarted={() => setPage('app')} />
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── NAV ─────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <button onClick={() => setPage('title')} className="flex items-center opacity-90 hover:opacity-100 transition-opacity">
            <HandraiseLogo size={40} textClass="text-blue-800" onDark={false} />
          </button>
          <span className="text-sm text-gray-400 hidden sm:block">Volunteer Match Results</span>
        </div>
      </nav>

      {/* ── PREFERENCE FORM ─────────────────── */}
      <section id="form" className="max-w-6xl mx-auto px-8 py-14">
        <h2 className="text-2xl font-medium text-gray-800 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your Preferences</h2>
        <p className="text-gray-400 text-base mb-8">
          Choose an option in every section, then click <strong className="text-gray-600">Finish</strong> to see
          matching roles. Changing any answer clears results until you finish again.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 space-y-10">

          {/* Language — first for accessibility */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-1.5">Language</label>
            <p className="text-sm text-gray-400 mb-4">We support volunteers from every linguistic background.</p>
            <div className="flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((l) => (
                <PillButton key={l} label={l} active={language === l} onClick={() => setLanguage(l)} />
              ))}
            </div>
          </div>

          {/* Cause Area */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-4">Cause Area</label>
            <div className="flex flex-wrap gap-3">
              {CAUSE_OPTIONS.map((c) => (
                <PillButton key={c} label={c} active={causeArea === c} onClick={() => setCauseArea(c)} />
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-4">Your Background</label>
            <div className="flex flex-wrap gap-3">
              {BACKGROUND_OPTIONS.map((b) => (
                <PillButton key={b} label={b} active={background === b} onClick={() => setBackground(b)} />
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-4">
              Skills <span className="text-gray-400 font-normal">(pick any that apply)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {ALL_SKILLS.map((skill) => (
                <PillButton
                  key={skill}
                  label={skill}
                  active={selectedSkills.includes(skill)}
                  onClick={() => toggleSkill(skill)}
                />
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-4">
              Availability <span className="text-gray-400 font-normal">(pick any that apply)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {ALL_AVAILABILITY.map((slot) => (
                <PillButton
                  key={slot}
                  label={slot}
                  active={selectedAvailability.includes(slot)}
                  onClick={() => toggleAvailability(slot)}
                />
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-base font-bold text-gray-700 mb-4">Preferred Location</label>
            <div className="flex flex-wrap gap-3">
              {LOCATION_OPTIONS.map((l) => (
                <PillButton key={l} label={l} active={location === l} onClick={() => setLocation(l)} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-2">
            <button
              type="button"
              onClick={handleFinish}
              disabled={!formComplete}
              className={`text-lg font-bold px-10 py-4 rounded-xl transition-colors ${
                formComplete
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Finish — show matching roles
            </button>
            {hasStarted && (
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 text-base transition-colors"
              >
                Reset form
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ── MATCH RESULTS ───────────────────── */}
      <section id="results" className="max-w-6xl mx-auto px-8 pb-24">

        {!showResults ? (
          <>
            <h2 className="text-2xl font-medium text-gray-800 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your matches</h2>
            <p className="text-gray-400 text-base mb-8">
              Complete every section in the form above and click <strong className="text-gray-500">Finish</strong> to
              see roles here. Nothing is listed until then.
            </p>
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white py-20 px-6 text-center text-gray-300 text-lg">
              No roles shown yet.
            </div>
          </>
        ) : (
          <>
            {/* Results header */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
              <div>
                <h2 className="text-2xl font-medium text-gray-800 flex items-baseline gap-1.5">
                  {matches.length > 0 ? (
                    <>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{matches.length}</span>
                      <span style={{ fontFamily: 'var(--font-display)' }}>
                        {`Role${matches.length > 1 ? 's' : ''} Match Your Preferences`}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-display)' }}>No Roles Found</span>
                  )}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {matches.length > 0
                    ? 'Sorted by match score — best fit first.'
                    : (() => {
                        const tooStrict = []
                        if (causeArea && ROLES.every((r) => r.causeArea !== causeArea)) tooStrict.push(`Cause "${causeArea}"`)
                        if (background && ROLES.every((r) => r.background !== background)) tooStrict.push(`Background "${background}"`)
                        if (language && ROLES.every((r) => r.language !== language)) tooStrict.push(`Language "${language}"`)
                        if (location && ROLES.every((r) => r.location !== location)) tooStrict.push(`Location "${location}"`)
                        return tooStrict.length > 0
                          ? `No roles match ${tooStrict.join(' + ')} with your other choices. Try different options.`
                          : 'No roles match this full combination. Try adjusting your filters and click Finish again.'
                      })()}
                </p>
              </div>
              {activeFilterLabels.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilterLabels.map((label) => (
                    <span key={label} className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
              {matches.map((role) => (
                <RoleCard key={role.id} role={role} score={role.score} />
              ))}
            </div>
          </>
        )}
      </section>

    </div>
  )
}

export default App
