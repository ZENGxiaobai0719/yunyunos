import type { Lang } from '../../lang'
import { pickText, pickMaybeI18n } from '../../lang'
import type { PortfolioContent } from '../../portfolioData'

export default function ExperienceSection(props: { lang: Lang; content: PortfolioContent['experience'] }) {
  const { lang, content } = props

  return (
    <section id="experience" className="user-section user-experience-section">
      <div className="user-section-container">
        <div className="user-section-header">
          <span className="user-section-number">03</span>
          <h2 className="user-section-title">
            <span className="user-title-bracket">&lt;</span>
            <span className="user-title-text">{pickText(content.title, lang)}</span>
            <span className="user-title-bracket">/&gt;</span>
          </h2>
          <div className="user-section-line" />
        </div>

        <div className="user-experience-list">
          {content.items.map((item, idx) => (
            <div className="user-experience-item" key={idx}>
              <div className="user-experience-dot" />
              <div className="user-experience-card">
                <div className="user-experience-header">
                  <span className="user-experience-year">{pickMaybeI18n(item.year, lang)}</span>
                  {pickMaybeI18n(item.badge, lang) && (
                    <span className="user-experience-badge">{pickMaybeI18n(item.badge, lang)}</span>
                  )}
                </div>
                <div className="user-experience-title-text">{pickMaybeI18n(item.title, lang)}</div>
                <div className="user-experience-company">{item.company}</div>
                <p className="user-experience-description">{pickMaybeI18n(item.description, lang)}</p>
                {item.achievements.length > 0 && (
                  <ul className="user-experience-achievements">
                    {item.achievements.map((ach, i) => (
                      <li key={i}>{pickMaybeI18n(ach, lang)}</li>
                    ))}
                  </ul>
                )}
                <div className="user-experience-tags">
                  {item.tags.map((tag) => (
                    <span className="user-tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
