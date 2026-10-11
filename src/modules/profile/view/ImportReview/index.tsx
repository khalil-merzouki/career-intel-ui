import './styles.css'
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Languages,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { InfoAside, ReviewRow, StepLayout } from '../../components/components'
import { useProfile } from '../../hooks/profileContext'
import { SkillGroups } from '../../components/SkillGroups'

export function ImportReviewView() {
  const { profile } = useProfile()
  const navigate = useNavigate()
  if (!profile) return null
  return (
    <StepLayout
      step={3}
      total={5}
      title="Review your profile"
      description="We’ve filled in what we could find in your CV. Confirm or edit each section."
      back="/profile/setup/upload"
      next="/profile/preferences"
      nextLabel="Continue to preferences"
      aside={
        <InfoAside
          title="Review every detail."
          text="The imported details are a starting point. Keep what is useful and correct the rest."
        />
      }
    >
      <div className="review-list">
        <ReviewRow
          icon={<BriefcaseBusiness size={20} />}
          title="Current role"
          to="/profile/setup/experience"
        >
          <p>{profile.currentRole || 'Not added'}</p>
        </ReviewRow>
        <ReviewRow
          icon={<BriefcaseBusiness size={20} />}
          title="Previous experience"
          to="/profile/setup/experience"
        >
          {profile.experience.length ? (
            profile.experience.map((item) => (
              <p key={item.id}>
                {item.role} · {item.company} · {item.period}
              </p>
            ))
          ) : (
            <p>Not added</p>
          )}
        </ReviewRow>
        <ReviewRow
          icon={<Wrench size={20} />}
          title="Skills & proficiency"
          to="/profile/setup/skills"
        >
          <SkillGroups skills={profile.skills} />
        </ReviewRow>
        <ReviewRow
          icon={<GraduationCap size={20} />}
          title="Education"
          to="/profile/setup/qualifications"
        >
          {profile.education.length ? (
            profile.education.map((item) => (
              <p key={item.id}>
                {item.qualification} · {item.institution}
              </p>
            ))
          ) : (
            <p>Not added</p>
          )}
        </ReviewRow>
        <ReviewRow
          icon={<Award size={20} />}
          title="Certifications"
          to="/profile/setup/qualifications"
        >
          {profile.certifications.length ? (
            profile.certifications.map((item) => (
              <p key={item.id}>
                {item.name} · {item.issuer}
              </p>
            ))
          ) : (
            <p>Not added</p>
          )}
        </ReviewRow>
        <ReviewRow
          icon={<Languages size={20} />}
          title="Languages"
          to="/profile/setup/qualifications"
        >
          {profile.languages.length ? (
            profile.languages.map((item) => (
              <p key={item.id}>
                {item.name} · {item.proficiency}
              </p>
            ))
          ) : (
            <p>Not added</p>
          )}
        </ReviewRow>
      </div>
      <p className="help-text">
        <Sparkles size={16} /> Your career interests, work preferences, and
        salary expectations are entered in the next step.
      </p>
      {!profile.importedFile && (
        <button
          className="text-button"
          type="button"
          onClick={() => navigate({ to: '/profile/setup/upload' })}
        >
          Choose a CV first
        </button>
      )}
    </StepLayout>
  )
}
