import './styles.css'
import { useParams } from '@tanstack/react-router'
import {
  Field,
  HelpText,
  InfoAside,
  StepLayout,
} from '../../../../shared/components'
import { RequirementsEditor } from '../../components/RequirementsEditor'
import { useJobReview } from '../../hooks/useJobReview'
import type { JobType, WorkType } from '../../types'

export function JobReviewView() {
  const params = useParams({ strict: false })
  const job = useJobReview(String(params.jobId ?? ''))
  const { opportunity } = job
  return (
    <StepLayout
      step={2}
      total={2}
      eyebrow="JOB OPPORTUNITIES"
      title="Review the job analysis"
      description="Check the extracted information, adjust its classification, and confirm what matters for this opportunity."
      back="/jobs"
      nextLabel="Confirm analysis"
      onNext={job.confirm}
      busy={job.busy}
      error={job.error}
      aside={
        <InfoAside
          title="Review before you rely on it."
          text="Extracted requirements stay editable until you confirm the analysis."
        />
      }
    >
      {job.loading ? (
        <p className="job-loading" role="status">
          Loading job analysis…
        </p>
      ) : opportunity ? (
        <div className="form-stack">
          <section className="form-panel job-source-panel">
            <div className="panel-heading">
              <span className="section-number">
                <span aria-hidden="true">✓</span>
              </span>
              <div>
                <h2>{opportunity.role || 'Job opportunity'}</h2>
                <p>
                  {[opportunity.company, opportunity.workType]
                    .filter(Boolean)
                    .join(' · ') || 'Add any missing job details below.'}
                </p>
              </div>
            </div>
            <div className="form-grid">
              <Field
                label="Role"
                value={opportunity.role}
                onChange={(role) => job.updateDetails({ role })}
                placeholder="Role title"
              />
              <Field
                label="Company"
                value={opportunity.company}
                onChange={(company) => job.updateDetails({ company })}
                placeholder="Company name"
              />
              <Field
                label="Location"
                value={opportunity.location}
                onChange={(location) => job.updateDetails({ location })}
                placeholder="Worldwide or Unknown"
                hint={
                  opportunity.workType === 'remote'
                    ? 'Worldwide is used when a remote location is not specified.'
                    : 'Unknown is used when the job does not specify a location.'
                }
              />
              <label className="field">
                <span>Type of work</span>
                <select
                  value={opportunity.workType}
                  onChange={(event) =>
                    job.updateDetails({
                      workType: event.target.value as WorkType,
                      ...(event.target.value === 'remote' &&
                      opportunity.location === 'Unknown'
                        ? { location: 'Worldwide' }
                        : event.target.value !== 'remote' &&
                            opportunity.location === 'Worldwide'
                          ? { location: 'Unknown' }
                          : {}),
                    })
                  }
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                  <option value="unknown">Not specified</option>
                </select>
              </label>
              <label className="field">
                <span>Job type</span>
                <select
                  value={opportunity.jobType ?? 'unknown'}
                  onChange={(event) =>
                    job.updateDetails({
                      jobType: event.target.value as JobType,
                    })
                  }
                >
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="unknown">Not specified</option>
                </select>
              </label>
              <label className="field job-salary-field">
                <span>
                  Salary range{' '}
                  {opportunity.salarySource === 'estimated' ? (
                    <span className="salary-source-badge">Estimated</span>
                  ) : (
                    <span className="salary-source-badge listed">
                      From job offer
                    </span>
                  )}
                </span>
                <input
                  value={opportunity.salary}
                  onChange={(event) =>
                    job.updateDetails({ salary: event.target.value })
                  }
                  placeholder="Add a salary range"
                />
                <small>
                  {opportunity.salarySource === 'estimated'
                    ? 'No salary was listed. Review and adjust this estimate before confirming.'
                    : 'The job offer included this salary range. You can still edit it.'}
                </small>
              </label>
              <Field
                label="Job URL"
                value={opportunity.url}
                onChange={(url) => job.updateDetails({ url })}
                placeholder="https://…"
                type="url"
                error={job.urlError}
              />
            </div>
            <details className="job-original-description">
              <summary>View original job description</summary>
              <p>{opportunity.description}</p>
            </details>
          </section>

          <section className="form-panel">
            <div className="panel-heading">
              <span className="section-number">1</span>
              <div>
                <h2>Role expectations</h2>
                <p>
                  Verify seniority and experience before reviewing individual
                  criteria.
                </p>
              </div>
            </div>
            <div className="form-grid">
              <Field
                label="Seniority"
                value={opportunity.seniority}
                onChange={(seniority) => job.updateDetails({ seniority })}
                placeholder="e.g. Senior"
              />
              <Field
                label="Experience"
                value={opportunity.experience}
                onChange={(experience) => job.updateDetails({ experience })}
                placeholder="e.g. 5+ years of experience"
              />
            </div>
          </section>

          <section className="form-panel">
            <div className="panel-heading">
              <span className="section-number">2</span>
              <div>
                <h2>Extracted requirements</h2>
                <p>
                  Update the wording, remove inaccurate items, add missing ones,
                  and mark each as required or preferred.
                </p>
              </div>
            </div>
            <HelpText>
              Review the full description above if you need to check an
              extracted requirement.
            </HelpText>
            <RequirementsEditor
              requirements={opportunity.requirements}
              onChange={job.updateRequirement}
              onAdd={job.addRequirement}
              onRemove={job.removeRequirement}
            />
          </section>
        </div>
      ) : (
        <div className="form-panel">
          <p>The job analysis could not be found.</p>
        </div>
      )}
    </StepLayout>
  )
}
