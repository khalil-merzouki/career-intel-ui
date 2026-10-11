import type {
  JobOpportunity,
  JobOpportunityInput,
  DuplicateJob,
  MatchAnalysis,
  RecruiterMatch,
} from '../types'

export class DuplicateJobError extends Error {
  constructor(public readonly duplicate: DuplicateJob) {
    super(duplicate.message)
  }
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Something went wrong. Please try again.')
  }
  return response.json() as Promise<T>
}

export const jobApi = {
  list: () =>
    fetch('/api/jobs').then((response) => read<JobOpportunity[]>(response)),
  get: (id: string) =>
    fetch(`/api/jobs/${encodeURIComponent(id)}`).then((response) =>
      read<JobOpportunity>(response),
    ),
  match: (id: string) =>
    fetch(`/api/jobs/${encodeURIComponent(id)}/match`).then((response) =>
      read<MatchAnalysis>(response),
    ),
  evaluateMatch: (id: string) =>
    fetch(`/api/jobs/${encodeURIComponent(id)}/evaluate-match`, {
      method: 'POST',
    }).then((response) => read<RecruiterMatch>(response)),
  save: (opportunity: JobOpportunity) =>
    fetch(`/api/jobs/${encodeURIComponent(opportunity.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: opportunity.notes,
        trackingStatus: opportunity.trackingStatus,
      }),
    }).then((response) => read<JobOpportunity>(response)),
  analyze: (input: JobOpportunityInput) =>
    fetch('/api/jobs/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then(async (response) => {
      if (response.status === 409) {
        const error = await response.json()
        if (error.code === 'duplicate_url' || error.code === 'similar_job')
          throw new DuplicateJobError(error as DuplicateJob)
        throw new Error(error.message || 'Could not add this job.')
      }
      return read<JobOpportunity>(response)
    }),
  confirm: (opportunity: JobOpportunity) =>
    fetch(`/api/jobs/${encodeURIComponent(opportunity.id)}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity),
    }).then((response) => read<JobOpportunity>(response)),
}
