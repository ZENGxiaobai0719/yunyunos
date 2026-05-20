import type { Lang } from "../../lang";
import { pickMaybeI18n } from "../../lang";
import type { PortfolioContent } from "../../portfolioData";

export default function ProjectsSection(props: { lang: Lang; content: PortfolioContent["projects"] }) {
  const { lang, content } = props;

  return (
    <section id="projects" className="user-section user-projects-section">
      <div className="user-section-container">
        <div className="user-section-header">
          <span className="user-section-number">04</span>
          <h2 className="user-section-title">
            <span className="user-title-bracket">&lt;</span>
            <span className="user-title-text">{pickMaybeI18n(content.title as any, lang)}</span>
            <span className="user-title-bracket">/&gt;</span>
          </h2>
          <div className="user-section-line" />
        </div>

        <div className="user-projects-grid">
          {content.cards.map((card, idx) => (
            <div className="user-project-card" key={idx}>
              <div className="user-project-content">
                <h3 className="user-project-title">{pickMaybeI18n(card.title as any, lang)}</h3>
                <p className="user-project-description">{pickMaybeI18n(card.description as any, lang)}</p>
                <div className="user-project-tags">
                  {card.tags.map((tag) => (
                    <span className="user-tag" key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
