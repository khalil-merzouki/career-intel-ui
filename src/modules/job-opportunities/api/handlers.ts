import { http, HttpResponse } from 'msw'
import type { Profile } from '../../../shared/types/profile'
import type {
  JobOpportunity,
  JobOpportunityInput,
  JobRequirement,
  RequirementCategory,
  RequirementPriority,
} from '../types'
import { validateJobCapture } from '../utils/validation'
import { compareOpportunity } from './matchAnalysis'

const storageKey = 'career-intel-job-opportunities'
let opportunities = loadOpportunities()

function loadOpportunities(): JobOpportunity[] {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved
      ? (JSON.parse(saved) as JobOpportunity[]).map((item) => ({
          ...item,
          notes: item.notes ?? '',
          trackingStatus: item.trackingStatus ?? 'saved',
        }))
      : []
  } catch {
    return []
  }
}

function storeOpportunities(next: JobOpportunity[]) {
  opportunities = next
  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // Keep the in-memory mock available when browser storage is unavailable.
  }
}

function matchedPriority(
  description: string,
  term: string,
): RequirementPriority {
  const index = description.toLowerCase().indexOf(term.toLowerCase())
  const context = description
    .slice(
      Math.max(0, index - 70),
      Math.min(description.length, index + term.length + 70),
    )
    .toLowerCase()
  if (/preferred|nice.to.have|bonus|desirable|a plus/.test(context))
    return 'preferred'
  return 'required'
}

function sentenceFor(description: string, expressions: RegExp[]) {
  const sentence = description
    .split(/[\n.!?;]+/)
    .map((part) => part.trim())
    .find((part) => expressions.some((expression) => expression.test(part)))
  return sentence ?? ''
}

function uniqueRequirement(
  requirements: JobRequirement[],
  category: RequirementCategory,
  text: string,
  priority: RequirementPriority,
) {
  if (
    requirements.some(
      (item) =>
        item.category === category &&
        item.text.toLowerCase() === text.toLowerCase(),
    )
  )
    return
  requirements.push({
    id: crypto.randomUUID(),
    category,
    text,
    priority,
  })
}

function extractRequirements(input: JobOpportunityInput) {
  const description = input.description
  const requirements: JobRequirement[] = []
  const skills = [
    'React',
    'TypeScript',
    'JavaScript',
    'Python',
    'SQL',
    'AWS',
    'Azure',
    'Figma',
    'Product design',
    'User research',
    'Data analysis',
    'Agile',
    'Communication',
    'Leadership',
    'Node.js',
    'Docker',
    'Kubernetes',
    'Machine learning',
    'Project management',
    'Excel',
  ]
  for (const skill of skills) {
    if (
      new RegExp(
        `\\b${skill.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`,
        'i',
      ).test(description)
    ) {
      uniqueRequirement(
        requirements,
        'skill',
        skill,
        matchedPriority(description, skill),
      )
    }
  }

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Arabic',
    'Dutch',
    'Portuguese',
    'Italian',
    'Japanese',
    'Mandarin',
  ]
  for (const language of languages) {
    if (new RegExp(`\\b${language}\\b`, 'i').test(description)) {
      uniqueRequirement(
        requirements,
        'language',
        language,
        matchedPriority(description, language),
      )
    }
  }

  const certificationPatterns = [
    /(?:PMP|CISSP|CPA|CFA|AWS Certified [A-Za-z ]+|Google Cloud [A-Za-z ]+|professional certification)/gi,
  ]
  for (const expression of certificationPatterns) {
    for (const match of description.matchAll(expression)) {
      uniqueRequirement(
        requirements,
        'certification',
        match[0].trim(),
        matchedPriority(description, match[0]),
      )
    }
  }

  const workSentence = sentenceFor(description, [
    /work authorization/i,
    /eligible to work/i,
    /time zone/i,
    /travel up to/i,
    /relocation required/i,
  ])
  if (workSentence) {
    uniqueRequirement(
      requirements,
      'work',
      workSentence,
      matchedPriority(description, workSentence),
    )
  }
  const locationSentence = sentenceFor(description, [
    /located in/i,
    /based in/i,
    /relocate/i,
    /must be in/i,
  ])
  if (locationSentence && locationSentence !== workSentence) {
    uniqueRequirement(
      requirements,
      'location',
      locationSentence,
      matchedPriority(description, locationSentence),
    )
  }
  return requirements
}

function getJobDetails(description: string, url: string) {
  const lines = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const labeledRole = description
    .match(/^(?:role|job title|position)\s*:\s*(.+)$/im)?.[1]
    ?.trim()
  const firstLine = lines[0]?.replace(/^[-*#\s]+/, '').trim() ?? ''
  const role = labeledRole ?? firstLine.split(/\s+(?:at|@|[—|])\s+/i)[0].trim()
  const company =
    description.match(/^(?:company|employer)\s*:\s*(.+)$/im)?.[1]?.trim() ??
    description
      .match(/\bat\s+([A-Z][\w&.' -]{1,50})(?:\s*[,.\n]|$)/)?.[1]
      ?.trim() ??
    ''

  let workType: JobOpportunity['workType'] = 'unknown'
  if (/\bremote\b/i.test(description)) workType = 'remote'
  else if (/\bhybrid\b/i.test(description)) workType = 'hybrid'
  else if (/on[ -]site|in.office|office.based/i.test(description))
    workType = 'on-site'

  const jobType: JobOpportunity['jobType'] =
    /\b(permanent|indefinite|open[- ]ended|CDI)\b/i.test(description)
      ? 'permanent'
      : /\b(fixed[- ]term|temporary|freelance|contractor|contract|CDD)\b/i.test(
            description,
          )
        ? 'contract'
        : 'unknown'

  const labeledLocation = description
    .match(/^(?:location|based in|located in)\s*:\s*(.+)$/im)?.[1]
    ?.trim()
  const remoteLocation = description
    .match(/\bremote\s+(?:in|from)\s+([A-Z][\w ,'-]{1,45})/i)?.[1]
    ?.trim()
  const specifiedLocation =
    labeledLocation && !/^(remote|hybrid|on[ -]?site)$/i.test(labeledLocation)
      ? labeledLocation
      : undefined
  const location =
    specifiedLocation ??
    remoteLocation ??
    (workType === 'remote' ? 'Worldwide' : 'Unknown')

  const salaryLine = sentenceFor(description, [
    /salary/i,
    /compensation/i,
    /pay range/i,
    /[$€£]/,
  ])
  const listedSalary = salaryLine
    .match(
      /(?:[$€£]\s?\d[\d,.]*(?:\s?(?:-|–|to)\s?[$€£]?\s?\d[\d,.]*)?(?:\s?(?:k|K|per year|annually|\/year))?)/i,
    )?.[0]
    ?.trim()
  const seniority =
    role.match(
      /\b(intern|junior|mid[- ]level|senior|lead|staff|principal|director|head)\b/i,
    )?.[0] ??
    sentenceFor(description, [
      /\b(intern|junior|mid[- ]level|senior|lead|staff|principal|director|head)\b/i,
    ])
  const experience =
    description.match(
      /\b(?:at least |minimum of )?\d+(?:\s*[-–+]\s*\d+)?\s+years?\s+(?:of\s+)?(?:relevant\s+)?experience\b/i,
    )?.[0] ?? sentenceFor(description, [/years? of experience/i])
  const currency = /£|\b(?:UK|United Kingdom|London)\b/i.test(description)
    ? '£'
    : /\$|\b(?:US|USA|United States|New York|California)\b/i.test(description)
      ? '$'
      : '€'
  const normalizedSeniority = `${role} ${seniority}`.toLowerCase()
  const [estimateMin, estimateMax] =
    /senior|lead|staff|principal|director|head/.test(normalizedSeniority)
      ? [75000, 105000]
      : /junior|intern/.test(normalizedSeniority)
        ? [35000, 50000]
        : [50000, 75000]
  const estimatedSalary = `${currency}${estimateMin.toLocaleString('en-US')}–${currency}${estimateMax.toLocaleString('en-US')} / year`

  return {
    role,
    company,
    location,
    workType,
    jobType,
    salary: listedSalary ?? estimatedSalary,
    salarySource: listedSalary ? ('listed' as const) : ('estimated' as const),
    seniority,
    experience,
    url,
  }
}

function analyze(input: JobOpportunityInput): JobOpportunity {
  const details = getJobDetails(input.description, input.url)
  return {
    id: crypto.randomUUID(),
    ...input,
    ...details,
    requirements: extractRequirements(input),
    status: 'draft',
    trackingStatus: 'saved',
    notes: '',
    createdAt: new Date().toISOString(),
  }
}

function getMockOpportunity(id: string) {
  return opportunities.find((item) => item.id === id)
}

export function getMockOpportunities() {
  return opportunities
}

export function getApplicationSource(id: string) {
  return getMockOpportunity(id)
}

export function markOpportunityApplied(id: string) {
  const index = opportunities.findIndex((item) => item.id === id)
  if (index < 0) return
  const next = [...opportunities]
  next[index] = { ...next[index], trackingStatus: 'applied' }
  storeOpportunities(next)
}

export function createJobMatchHandlers(getProfile: () => Profile) {
  return [
    http.get('/api/jobs/:jobId/match', ({ params }) => {
      const opportunity = getMockOpportunity(String(params.jobId))
      return opportunity
        ? HttpResponse.json(compareOpportunity(opportunity, getProfile()))
        : HttpResponse.json(
            { message: 'Job opportunity not found.' },
            { status: 404 },
          )
    }),
  ]
}

export const jobHandlers = [
  http.get('/api/jobs', () => HttpResponse.json(opportunities)),
  http.get('/api/jobs/:jobId', ({ params }) => {
    const opportunity = opportunities.find((item) => item.id === params.jobId)
    return opportunity
      ? HttpResponse.json(opportunity)
      : HttpResponse.json(
          { message: 'Job opportunity not found.' },
          { status: 404 },
        )
  }),
  http.post('/api/jobs/analyze', async ({ request }) => {
    const input = (await request.json()) as JobOpportunityInput
    const validation = validateJobCapture(input)
    if (validation) {
      return HttpResponse.json({ message: validation }, { status: 400 })
    }
    if (
      input.allowSimilar !== undefined &&
      typeof input.allowSimilar !== 'boolean'
    ) {
      return HttpResponse.json(
        { message: 'Invalid duplicate confirmation.' },
        { status: 400 },
      )
    }
    const normalizedUrl = (value: string) => {
      if (!value.trim()) return ''
      const url = new URL(value.trim())
      url.hash = ''
      return url.toString().replace(/\/$/, '')
    }
    const url = normalizedUrl(input.url)
    const sameUrl =
      url && opportunities.find((item) => normalizedUrl(item.url) === url)
    if (sameUrl) {
      return HttpResponse.json(
        {
          code: 'duplicate_url',
          message: 'This job URL is already in your opportunities.',
          existing: {
            id: sameUrl.id,
            role: sameUrl.role,
            company: sameUrl.company,
            url: sameUrl.url,
          },
        },
        { status: 409 },
      )
    }
    const opportunity = analyze({
      url: input.url,
      description: input.description,
    })
    const normalizedName = (value: string) =>
      value.trim().replace(/\s+/g, ' ').toLowerCase()
    const role = normalizedName(opportunity.role)
    const company = normalizedName(opportunity.company)
    const similar =
      role &&
      company &&
      opportunities.find(
        (item) =>
          normalizedName(item.role) === role &&
          normalizedName(item.company) === company,
      )
    if (similar && !input.allowSimilar) {
      return HttpResponse.json(
        {
          code: 'similar_job',
          message:
            'A job with the same role and company already exists at another URL.',
          existing: {
            id: similar.id,
            role: similar.role,
            company: similar.company,
            url: similar.url,
          },
        },
        { status: 409 },
      )
    }
    storeOpportunities([opportunity, ...opportunities])
    return HttpResponse.json(opportunity, { status: 201 })
  }),
  http.post('/api/jobs/:jobId/confirm', async ({ params, request }) => {
    const updated = (await request.json()) as JobOpportunity
    const existingIndex = opportunities.findIndex(
      (item) => item.id === params.jobId,
    )
    if (existingIndex < 0) {
      return HttpResponse.json(
        { message: 'Job opportunity not found.' },
        { status: 404 },
      )
    }
    const confirmed = {
      ...updated,
      id: String(params.jobId),
      status: 'confirmed' as const,
    }
    const next = [...opportunities]
    next[existingIndex] = confirmed
    storeOpportunities(next)
    return HttpResponse.json(confirmed)
  }),
  http.put('/api/jobs/:jobId', async ({ params, request }) => {
    const index = opportunities.findIndex((item) => item.id === params.jobId)
    if (index < 0) {
      return HttpResponse.json(
        { message: 'Job opportunity not found.' },
        { status: 404 },
      )
    }
    const input = (await request.json()) as Pick<
      JobOpportunity,
      'notes' | 'trackingStatus'
    >
    if (
      !['saved', 'applied', 'archived'].includes(input.trackingStatus) ||
      typeof input.notes !== 'string'
    ) {
      return HttpResponse.json(
        { message: 'Invalid opportunity update.' },
        { status: 400 },
      )
    }
    const next = [...opportunities]
    next[index] = {
      ...next[index],
      notes: input.notes,
      trackingStatus: input.trackingStatus,
    }
    storeOpportunities(next)
    return HttpResponse.json(next[index])
  }),
]
