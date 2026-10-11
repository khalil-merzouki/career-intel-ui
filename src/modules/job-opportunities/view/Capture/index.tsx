import './styles.css'
import { Link } from '@tanstack/react-router'
import {
  Field,
  HelpText,
  InfoAside,
  StepLayout,
} from '../../../../shared/components'
import { useJobCapture } from '../../hooks/useJobCapture'

export function JobCaptureView() {
  const {
    form,
    updateField,
    analyze,
    duplicate,
    dismissDuplicate,
    busy,
    error,
    descriptionError,
    urlError,
    descriptionCharacters,
    minimumDescriptionCharacters,
  } = useJobCapture()
  return (
    <StepLayout
      step={1}
      total={2}
      eyebrow="JOB OPPORTUNITIES"
      title="Add a job opportunity"
      description="Paste the job offer and we’ll organize its details and requirements for you to review."
      back="/jobs"
      nextLabel="Analyze job"
      onNext={() => void analyze()}
      busy={busy}
      error={error}
      aside={
        <InfoAside
          title="Start with the source."
          text="The original job offer stays attached to your opportunity, so you can check the analysis against it."
        />
      }
    >
      <div className="form-stack">
        {duplicate && (
          <section
            className="job-duplicate"
            role="alert"
            aria-label="Existing opportunity"
          >
            <h2>
              {duplicate.code === 'duplicate_url'
                ? 'This job is already saved'
                : 'Similar job found'}
            </h2>
            <p>{duplicate.message}</p>
            <p>
              <strong>{duplicate.existing.role || 'Job opportunity'}</strong>
              {duplicate.existing.company &&
                ` at ${duplicate.existing.company}`}
            </p>
            <div className="job-duplicate-actions">
              <Link
                to="/jobs/$jobId"
                params={{ jobId: duplicate.existing.id }}
                className="button button-quiet"
              >
                View existing job
              </Link>
              {duplicate.code === 'similar_job' && (
                <button
                  type="button"
                  className="button button-primary"
                  disabled={busy}
                  onClick={() => void analyze(true)}
                >
                  Continue anyway
                </button>
              )}
              <button
                type="button"
                className="text-button"
                onClick={dismissDuplicate}
              >
                Dismiss
              </button>
            </div>
          </section>
        )}
        <section className="form-panel">
          <div className="panel-heading">
            <span className="section-number">1</span>
            <div>
              <h2>Original job offer</h2>
              <p>
                Paste the full description. You can add the posting link as a
                reference.
              </p>
            </div>
          </div>
          <Field
            className="job-description-field"
            label="Job description"
            value={form.description}
            onChange={(value) => updateField('description', value)}
            placeholder="Paste the full job offer here…"
            multiline
            rows={16}
            required
            hint={`At least ${minimumDescriptionCharacters} characters · ${descriptionCharacters} entered`}
            error={descriptionError}
          />
          <div className="job-url-field">
            <Field
              label="Job URL (optional)"
              value={form.url}
              onChange={(value) => updateField('url', value)}
              placeholder="https://…"
              type="url"
              error={urlError}
            />
          </div>
          <HelpText>
            The original description is stored with the opportunity and remains
            available during review.
          </HelpText>
        </section>
      </div>
    </StepLayout>
  )
}
