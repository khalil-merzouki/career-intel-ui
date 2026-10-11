import type { Skill } from '../types'

export function SkillGroups({ skills }: { skills: Skill[] }) {
  const groups = new Map<string, Skill[]>()
  for (const skill of skills) {
    if (!skill.name.trim()) continue
    const category = skill.category?.trim() || 'Other skills'
    const existing = [...groups.keys()].find(
      (name) => name.toLowerCase() === category.toLowerCase(),
    )
    const key = existing ?? category
    groups.set(key, [...(groups.get(key) ?? []), skill])
  }

  if (!groups.size) return <p>No skills added</p>

  const orderedGroups = [...groups].sort(([a], [b]) =>
    a === 'Other skills' ? 1 : b === 'Other skills' ? -1 : 0,
  )

  return (
    <div className="skill-groups">
      {orderedGroups.map(([category, items]) => (
        <div className="skill-group" key={category}>
          <h3>{category}</h3>
          <div className="chip-list">
            {items.map((item) => (
              <span className="chip" key={item.id}>
                {item.name} · {item.proficiency}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
