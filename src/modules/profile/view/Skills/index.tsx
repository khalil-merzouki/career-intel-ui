import './styles.css'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import { InfoAside, StepLayout } from '../../components/components'
import { useProfile } from '../../hooks/profileContext'
import type { Proficiency } from '../../types'

const levels: Proficiency[] = [
  'Unspecified',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
]

export function SkillsView() {
  const { profile, update, save } = useProfile()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  if (!profile) return null
  const reviewingCv = profile.source === 'cv' && !profile.complete

  async function next() {
    setBusy(true)
    const success = await save()
    setBusy(false)
    if (success)
      navigate({
        to: profile?.complete
          ? '/profile'
          : reviewingCv
            ? '/profile/setup/import-review'
            : '/profile/setup/qualifications',
      })
  }

  return (
    <StepLayout
      step={3}
      total={6}
      progressLabel={
        profile.complete
          ? 'Edit profile'
          : reviewingCv
            ? 'Review imported profile'
            : undefined
      }
      title="Skills you bring"
      description="Add your skills, group them by category, and choose a proficiency level for each one."
      back={
        profile.complete
          ? '/profile/edit'
          : reviewingCv
            ? '/profile/setup/import-review'
            : '/profile/setup/experience'
      }
      nextLabel={
        profile.complete
          ? 'Save changes'
          : reviewingCv
            ? 'Save and return'
            : 'Continue'
      }
      onNext={next}
      busy={busy}
      aside={
        <InfoAside
          title="Your strengths, in context."
          text="Proficiency gives more meaning to each skill than a list alone."
          variant="orbit"
        />
      }
    >
      <section className="form-panel">
        <div className="panel-heading">
          <span className="section-number">3</span>
          <div>
            <h2>Skills & proficiency</h2>
            <p>Focus on the skills most relevant to your next role.</p>
          </div>
        </div>
        <div className="skill-list">
          {profile.skills.map((skill, index) => (
            <div className="skill-edit-row" key={skill.id}>
              <label className="field">
                <span>Skill {index + 1}</span>
                <input
                  value={skill.name}
                  onChange={(event) =>
                    update({
                      skills: profile.skills.map((entry) =>
                        entry.id === skill.id
                          ? { ...entry, name: event.target.value }
                          : entry,
                      ),
                    })
                  }
                  placeholder="e.g. User research"
                />
              </label>
              <label className="field">
                <span>Category</span>
                <input
                  value={skill.category ?? ''}
                  onChange={(event) =>
                    update({
                      skills: profile.skills.map((entry) =>
                        entry.id === skill.id
                          ? { ...entry, category: event.target.value }
                          : entry,
                      ),
                    })
                  }
                  placeholder="e.g. Programming languages"
                  maxLength={100}
                />
              </label>
              <label className="field">
                <span>Proficiency</span>
                <select
                  value={skill.proficiency}
                  onChange={(event) =>
                    update({
                      skills: profile.skills.map((entry) =>
                        entry.id === skill.id
                          ? {
                              ...entry,
                              proficiency: event.target.value as Proficiency,
                            }
                          : entry,
                      ),
                    })
                  }
                >
                  {levels.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="icon-button skill-remove"
                aria-label={`Remove skill ${index + 1}`}
                onClick={() =>
                  update({
                    skills: profile.skills.filter(
                      (entry) => entry.id !== skill.id,
                    ),
                  })
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="add-button"
          onClick={() =>
            update({
              skills: [
                ...profile.skills,
                {
                  id: crypto.randomUUID(),
                  name: '',
                  proficiency: 'Intermediate',
                  category: '',
                },
              ],
            })
          }
        >
          <Plus size={17} /> Add skill
        </button>
      </section>
    </StepLayout>
  )
}
