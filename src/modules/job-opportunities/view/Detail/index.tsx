import './styles.css'
import { Link, useParams } from '@tanstack/react-router'
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  BookmarkCheck,
  Check,
  ClipboardList,
  Pencil,
  RotateCcw,
  Save,
} from 'lucide-react'
import { StepLayout } from '../../../../shared/components'
import { MatchAnalysis } from '../../components/MatchAnalysis'
import { useJobDetail } from '../../hooks/useJobDetail'
import type { JobRequirement } from '../../types'

const categoryNames: Record<JobRequirement['category'], string> = {
  skill: 'Skills',
  language: 'Languages',
  certification: 'Certifications',
  education: 'Education',
  location: 'Location',
  work: 'Work constraints',
}

export function JobDetailView() {
  const params = useParams({ strict: false })
  const job = useJobDetail(String(params.jobId ?? ''))
  const opportunity = job.opportunity
  return (
    <StepLayout
      step={1}
      total={1}
      showProgress={false}
      eyebrow="JOB OPPORTUNITIES"
      title={opportunity?.role || 'Opportunity detail'}
      description={
        opportunity
          ? [
              opportunity.company,
              opportunity.location,
              opportunity.workType !== 'unknown' ? opportunity.workType : '',
            ]
              .filter(Boolean)
              .join(' · ') ||
            'Review this opportunity and your alignment with it.'
          : 'Review the opportunity and your alignment with it.'
      }
      back="/jobs"
      error={job.error}
    >
      {job.loading ? (
        <p className="job-loading" role="status">
          Loading opportunity…
        </p>
      ) : !opportunity ? (
        <section className="form-panel">
          <p>This opportunity could not be found.</p>
          <Link to="/jobs" className="edit-link">
            Back to opportunities <ArrowRight size={15} />
          </Link>
        </section>
      ) : (
        <>
          <nav className="detail-nav" aria-label="Opportunity sections">
            <a href="#job-summary">Summary</a>
            <a href="#job-description">Original description</a>
            <a href="#job-requirements">Requirements</a>
            <a href="#job-match">Match analysis</a>
            <a href="#job-notes">Notes</a>
          </nav>
          <div className="detail-stack">
            <section
              className="form-panel detail-summary"
              id="job-summary"
              aria-labelledby="summary-title"
            >
              <div className="detail-section-heading">
                <div>
                  <p className="detail-kicker">OPPORTUNITY</p>
                  <h2 id="summary-title">Job summary</h2>
                </div>
                <span className={`job-status ${opportunity.status}`}>
                  {opportunity.status === 'confirmed'
                    ? 'Analysis confirmed'
                    : 'Analysis needs review'}
                </span>
              </div>
              <div className="detail-facts">
                <div>
                  <span>Company</span>
                  <strong>{opportunity.company || 'Not specified'}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{opportunity.location || 'Unknown'}</strong>
                </div>
                <div>
                  <span>Work model</span>
                  <strong>
                    {opportunity.workType === 'unknown'
                      ? 'Not specified'
                      : opportunity.workType}
                  </strong>
                </div>
                <div>
                  <span>Job type</span>
                  <strong>
                    {opportunity.jobType === 'permanent'
                      ? 'Permanent'
                      : opportunity.jobType === 'contract'
                        ? 'Contract'
                        : 'Not specified'}
                  </strong>
                </div>
                <div>
                  <span>Seniority</span>
                  <strong>{opportunity.seniority || 'Not specified'}</strong>
                </div>
                <div>
                  <span>Experience</span>
                  <strong>{opportunity.experience || 'Not specified'}</strong>
                </div>
                <div>
                  <span>
                    Salary range{' '}
                    {opportunity.salarySource === 'estimated' && (
                      <em>Estimate</em>
                    )}
                  </span>
                  <strong>{opportunity.salary || 'Not specified'}</strong>
                </div>
              </div>
              <div className="detail-actions">
                <Link
                  to="/jobs/$jobId/review"
                  params={{ jobId: opportunity.id }}
                  className="button button-quiet"
                >
                  <Pencil size={16} /> Edit analysis
                </Link>
                <Link
                  to="/applications/new/$jobId"
                  params={{ jobId: opportunity.id }}
                  className="button button-quiet"
                >
                  <ClipboardList size={16} /> Track application
                </Link>
                {job.canApply ? (
                  <a
                    className="button button-primary"
                    href={opportunity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open job posting to apply in a new tab"
                  >
                    Apply <ArrowUpRight size={17} />
                  </a>
                ) : (
                  <>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled
                    >
                      Apply <ArrowUpRight size={17} />
                    </button>
                    <span className="detail-apply-unavailable">
                      Add a valid job URL to open the posting to apply.
                    </span>
                  </>
                )}
                {opportunity.trackingStatus === 'archived' ? (
                  <button
                    className="button button-quiet"
                    disabled={job.busy}
                    onClick={() => void job.setTrackingStatus('saved')}
                  >
                    <RotateCcw size={16} /> Restore
                  </button>
                ) : (
                  <button
                    className="button button-quiet"
                    disabled={job.busy}
                    onClick={() => void job.setTrackingStatus('archived')}
                  >
                    <Archive size={16} /> Archive
                  </button>
                )}
              </div>
              <div className="detail-tracking">
                <BookmarkCheck size={16} />
                <span>
                  Status:{' '}
                  {opportunity.trackingStatus === 'applied'
                    ? 'Applied'
                    : opportunity.trackingStatus === 'archived'
                      ? 'Archived'
                      : 'Saved'}
                </span>
              </div>
            </section>

            <section
              className="form-panel"
              id="job-description"
              aria-labelledby="description-title"
            >
              <div className="detail-section-heading">
                <div>
                  <p className="detail-kicker">SOURCE</p>
                  <h2 id="description-title">Original description</h2>
                </div>
              </div>
              <p className="detail-section-intro">
                The original job offer is kept alongside the confirmed analysis.
              </p>
              <div
                className="detail-description"
                tabIndex={0}
                aria-label="Original job description"
              >
                {opportunity.description}
              </div>
              {job.canApply && (
                <a
                  href={opportunity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="edit-link"
                >
                  View original posting <ArrowUpRight size={15} />
                </a>
              )}
            </section>

            <section
              className="form-panel"
              id="job-requirements"
              aria-labelledby="requirements-title"
            >
              <div className="detail-section-heading">
                <div>
                  <p className="detail-kicker">CRITERIA</p>
                  <h2 id="requirements-title">Requirements</h2>
                </div>
                <span className="detail-count">
                  {opportunity.requirements.length}{' '}
                  {opportunity.status === 'confirmed'
                    ? 'confirmed'
                    : 'extracted'}{' '}
                  items
                </span>
              </div>
              <p className="detail-section-intro">
                These are the criteria you reviewed. Edit the analysis if the
                source says something different.
              </p>
              {opportunity.requirements.length ? (
                <div className="detail-requirements">
                  {opportunity.requirements.map((requirement) => (
                    <div className="detail-requirement" key={requirement.id}>
                      <span
                        className={`detail-priority ${requirement.priority}`}
                      >
                        {requirement.priority}
                      </span>
                      <div>
                        <strong>{requirement.text}</strong>
                        <small>{categoryNames[requirement.category]}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="detail-empty">
                  No individual requirements have been confirmed yet.
                </p>
              )}
            </section>

            <section
              className="form-panel"
              id="job-match"
              aria-labelledby="match-title"
            >
              <div className="detail-section-heading">
                <div>
                  <p className="detail-kicker">YOUR ALIGNMENT</p>
                  <h2 id="match-title">Match analysis</h2>
                </div>
              </div>
              {job.analysis && <MatchAnalysis analysis={job.analysis} />}
              <div className="recruiter-match">
                <h3>Recruiter review</h3>
                <p>
                  Check your documented required skills first. If coverage is
                  above 65%, an AI recruiter will review your saved profile and
                  this job description.
                </p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void job.evaluateMatch()}
                  disabled={
                    job.evaluating || opportunity.status !== 'confirmed'
                  }
                >
                  {job.evaluating ? 'Evaluating…' : 'Evaluate candidate fit'}
                </button>
                {job.recruiterMatch && (
                  <div className="recruiter-match-result" role="status">
                    <strong>
                      Required skill coverage:{' '}
                      {job.recruiterMatch.score === null
                        ? 'Unavailable'
                        : `${job.recruiterMatch.score}%`}
                    </strong>
                    <p>{job.recruiterMatch.summary}</p>
                    {job.recruiterMatch.stage === 'recruiter-reviewed' && (
                      <p>
                        <strong>
                          Interview recommendation:{' '}
                          {job.recruiterMatch.recommendInterview
                            ? 'Invite'
                            : 'Do not invite'}
                        </strong>
                      </p>
                    )}
                    {job.recruiterMatch.matchedSkills.length > 0 && (
                      <p>
                        Matched: {job.recruiterMatch.matchedSkills.join(', ')}
                      </p>
                    )}
                    {job.recruiterMatch.missingSkills.length > 0 && (
                      <p>
                        Missing evidence:{' '}
                        {job.recruiterMatch.missingSkills.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section
              className="form-panel"
              id="job-notes"
              aria-labelledby="notes-title"
            >
              <div className="detail-section-heading">
                <div>
                  <p className="detail-kicker">PRIVATE WORKSPACE</p>
                  <h2 id="notes-title">Notes</h2>
                </div>
              </div>
              <label className="field">
                <span>Your notes</span>
                <textarea
                  value={job.notes}
                  onChange={(event) => job.setNotes(event.target.value)}
                  placeholder="Add your thoughts, questions, or next steps for this opportunity…"
                  rows={5}
                />
              </label>
              <div className="detail-notes-footer">
                <span>
                  {job.notesChanged
                    ? 'You have unsaved notes.'
                    : 'Notes are saved with this opportunity.'}
                </span>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void job.save()}
                  disabled={job.busy || !job.notesChanged}
                >
                  <Save size={16} /> Save notes
                </button>
              </div>
            </section>
          </div>
          {job.notice && (
            <p className="detail-toast" role="status">
              <Check size={17} /> {job.notice}
            </p>
          )}
        </>
      )}
    </StepLayout>
  )
}
