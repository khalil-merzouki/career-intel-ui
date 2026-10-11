import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { DuplicateJobError, jobApi } from '../api/jobApi'
import type { DuplicateJob, JobOpportunityInput } from '../types'
import {
  isValidJobUrl,
  MIN_JOB_DESCRIPTION_CHARACTERS,
  validateJobCapture,
} from '../utils/validation'

const emptyForm: JobOpportunityInput = {
  url: '',
  description: '',
}

export function useJobCapture() {
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [duplicate, setDuplicate] = useState<DuplicateJob | null>(null)
  const navigate = useNavigate()

  function updateField(field: keyof JobOpportunityInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setDuplicate(null)
    if (
      field === 'description' &&
      value.trim().length >= MIN_JOB_DESCRIPTION_CHARACTERS
    ) {
      setDescriptionError('')
    }
    if (field === 'url' && (!value.trim() || isValidJobUrl(value.trim()))) {
      setUrlError('')
    }
  }

  async function analyze(allowSimilar = false) {
    const validation = validateJobCapture(form)
    if (validation) {
      setDescriptionError(
        form.description.trim().length < MIN_JOB_DESCRIPTION_CHARACTERS
          ? validation
          : '',
      )
      setUrlError(
        form.description.trim().length >= MIN_JOB_DESCRIPTION_CHARACTERS &&
          form.url.trim() &&
          !isValidJobUrl(form.url.trim())
          ? validation
          : '',
      )
      return
    }
    setDescriptionError('')
    setUrlError('')
    setBusy(true)
    setError('')
    try {
      const opportunity = await jobApi.analyze({ ...form, allowSimilar })
      await navigate({
        to: '/jobs/$jobId/review',
        params: { jobId: opportunity.id },
      })
    } catch (issue) {
      if (issue instanceof DuplicateJobError) setDuplicate(issue.duplicate)
      else setError((issue as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return {
    form,
    updateField,
    analyze,
    duplicate,
    dismissDuplicate: () => setDuplicate(null),
    busy,
    error,
    descriptionError,
    urlError,
    descriptionCharacters: form.description.trim().length,
    minimumDescriptionCharacters: MIN_JOB_DESCRIPTION_CHARACTERS,
  }
}
