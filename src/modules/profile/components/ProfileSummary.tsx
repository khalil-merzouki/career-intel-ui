import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Languages,
  MapPin,
  Sparkles,
  Wallet,
  Wrench,
} from 'lucide-react'
import { ReviewRow } from './components'
import type { Profile } from '../types'
import { SkillGroups } from './SkillGroups'

export function ProfileSummary({
  profile,
  editable = false,
}: {
  profile: Profile
  editable?: boolean
}) {
  return (
    <div className="review-list">
      <ReviewRow
        icon={<BriefcaseBusiness size={20} />}
        title="Current role & experience"
        to={editable ? '/profile/setup/experience' : undefined}
      >
        <p>{profile.currentRole || 'No current role added'}</p>
        {profile.experience.map((item) => (
          <p key={item.id}>
            {item.role}
            {item.company && ` · ${item.company}`}
            {item.period && ` · ${item.period}`}
          </p>
        ))}
      </ReviewRow>
      <ReviewRow
        icon={<Wrench size={20} />}
        title="Skills & proficiency"
        to={editable ? '/profile/setup/skills' : undefined}
      >
        <SkillGroups skills={profile.skills} />
      </ReviewRow>
      <ReviewRow
        icon={<GraduationCap size={20} />}
        title="Education"
        to={editable ? '/profile/setup/qualifications' : undefined}
      >
        {profile.education.length ? (
          profile.education.map((item) => (
            <p key={item.id}>
              {item.qualification}
              {item.institution && ` · ${item.institution}`}
            </p>
          ))
        ) : (
          <p>Not added</p>
        )}
      </ReviewRow>
      <ReviewRow
        icon={<Award size={20} />}
        title="Certifications"
        to={editable ? '/profile/setup/qualifications' : undefined}
      >
        {profile.certifications.length ? (
          profile.certifications.map((item) => (
            <p key={item.id}>
              {item.name}
              {item.issuer && ` · ${item.issuer}`}
            </p>
          ))
        ) : (
          <p>Not added</p>
        )}
      </ReviewRow>
      <ReviewRow
        icon={<Languages size={20} />}
        title="Languages"
        to={editable ? '/profile/setup/qualifications' : undefined}
      >
        {profile.languages.length ? (
          profile.languages.map((item) => (
            <p key={item.id}>
              {item.name}
              {item.proficiency && ` · ${item.proficiency}`}
            </p>
          ))
        ) : (
          <p>Not added</p>
        )}
      </ReviewRow>
      <ReviewRow
        icon={<Sparkles size={20} />}
        title="Career interests"
        to={editable ? '/profile/preferences' : undefined}
      >
        <div className="chip-list">
          {profile.interests.length ? (
            profile.interests.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))
          ) : (
            <p>Not added</p>
          )}
        </div>
      </ReviewRow>
      <ReviewRow
        icon={<MapPin size={20} />}
        title="Work & location"
        to={editable ? '/profile/preferences' : undefined}
      >
        <p>
          {[...profile.workModels, ...profile.locations].join(' · ') ||
            'Not added'}
        </p>
      </ReviewRow>
      <ReviewRow
        icon={<Wallet size={20} />}
        title="Salary expectations"
        to={editable ? '/profile/preferences' : undefined}
      >
        <p>
          {profile.salaryMinimum || profile.salaryTarget
            ? `${profile.salaryCurrency} ${profile.salaryMinimum || '—'} minimum · ${profile.salaryTarget || '—'} target`
            : 'Not added'}
        </p>
      </ReviewRow>
    </div>
  )
}
