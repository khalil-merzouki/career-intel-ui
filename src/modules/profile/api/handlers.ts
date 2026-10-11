import { http, HttpResponse } from 'msw'
import type { Profile } from '../types'

const emptyProfile: Profile = {
  currentRole: '',
  experience: [],
  skills: [],
  education: [],
  certifications: [],
  languages: [],
  interests: [],
  workModels: [],
  locations: [],
  salaryCurrency: 'EUR',
  salaryMinimum: '',
  salaryTarget: '',
  source: null,
  importedFile: null,
  complete: false,
}

const storageKey = 'career-intel-mock-profile'

function loadProfile(): Profile {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? (JSON.parse(saved) as Profile) : emptyProfile
  } catch {
    return emptyProfile
  }
}

function storeProfile(next: Profile) {
  profile = next
  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // The mock remains usable in memory when browser storage is unavailable.
  }
}

let profile = loadProfile()

export function getMockProfile() {
  return profile
}

export const profileHandlers = [
  http.get('/api/profile', () => HttpResponse.json(profile)),
  http.post('/api/profile/reset', () => {
    storeProfile(emptyProfile)
    return HttpResponse.json(profile)
  }),
  http.put('/api/profile', async ({ request }) => {
    storeProfile((await request.json()) as Profile)
    return HttpResponse.json(profile)
  }),
  http.post('/api/profile/import', async ({ request }) => {
    const form = await request.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string' || !('name' in file)) {
      return HttpResponse.json(
        { message: 'Choose a CV to import.' },
        { status: 400 },
      )
    }
    storeProfile({
      ...emptyProfile,
      currentRole: 'Product Designer',
      experience: [
        {
          id: 'exp-1',
          role: 'Senior Product Designer',
          company: 'Northstar Studio',
          period: '01/2021 - present',
          description: 'Led product discovery and design systems.',
        },
        {
          id: 'exp-2',
          role: 'Product Designer',
          company: 'Forma',
          period: '01/2018 - 12/2021',
          description: 'Designed research-led digital experiences.',
        },
      ],
      skills: [
        {
          id: 'skill-1',
          name: 'Figma',
          proficiency: 'Advanced',
          category: 'Design tools',
        },
        {
          id: 'skill-2',
          name: 'User research',
          proficiency: 'Advanced',
          category: 'Research',
        },
        {
          id: 'skill-3',
          name: 'Prototyping',
          proficiency: 'Intermediate',
          category: 'Design',
        },
      ],
      education: [
        {
          id: 'edu-1',
          qualification: 'BSc Design',
          institution: 'University of Barcelona',
          year: '2018',
        },
      ],
      certifications: [
        { id: 'cert-1', name: 'Google UX Design', issuer: 'Google' },
      ],
      languages: [
        { id: 'lang-1', name: 'English', proficiency: 'Fluent' },
        { id: 'lang-2', name: 'Spanish', proficiency: 'Native' },
      ],
      source: 'cv',
      importedFile: file.name,
    })
    return HttpResponse.json(profile)
  }),
]
