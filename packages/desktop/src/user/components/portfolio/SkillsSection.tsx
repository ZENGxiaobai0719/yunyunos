import { useRef, useEffect, useState } from 'react'
import type { Lang } from '../../lang'
import { pickText } from '../../lang'
import type { PortfolioContent } from '../../portfolioData'

export default function SkillsSection(props: { lang: Lang; content: PortfolioContent['skills'] }) {
  const { lang, content } = props
  const sectionRef = useRef<HTMLElement>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="skills" className="user-section user-skills-section" ref={sectionRef}>
      <div className="user-section-container">
        <div className="user-section-header">
          <span className="user-section-number">02</span>
          <h2 className="user-section-title">
            <span className="user-title-bracket">&lt;</span>
            <span className="user-title-text">{pickText(content.title, lang)}</span>
            <span className="user-title-bracket">/&gt;</span>
          </h2>
          <div className="user-section-line" />
        </div>

        <div className="user-skills-grid">
          {content.categories.map((category) => (
            <div className="user-skill-category" key={category.title.en}>
              <h3 className="user-skill-category-title">{pickText(category.title, lang)}</h3>
              {category.items.map((skill) => (
                <div className="user-skill-item" key={skill.name}>
                  <div className="user-skill-header">
                    <span className="user-skill-name">{skill.name}</span>
                    <span className="user-skill-percent">{skill.percent}%</span>
                  </div>
                  <div className="user-skill-bar">
                    <div
                      className="user-skill-fill"
                      style={{ width: animated ? `${skill.percent}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
