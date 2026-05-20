"use client";

import type { Lang } from "../../lib/lang";
import { pickMaybeI18n } from "../../lib/lang";
import type { PortfolioContent } from "../../lib/portfolioData";
import PortfolioIcon from "./PortfolioIcon";

export default function ProjectsSection(props: { lang: Lang; content: PortfolioContent["projects"] }) {
  const { lang, content } = props;

  return (
    <section id="projects" className="section projects-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-number">04</span>
          <h2 className="section-title">
            <span className="title-bracket">&lt;</span>
            <span className="title-text">{pickMaybeI18n(content.title as any, lang)}</span>
            <span className="title-bracket">/&gt;</span>
          </h2>
          <div className="section-line" />
        </div>

        <div className="projects-grid">
          {content.cards.map((card, idx) => (
            <div className="project-card" key={idx}>
              <div className="project-image">
                <div className="project-overlay">
                  <div className="project-links">
                    <a href="#" className="project-link" title="View Project">
                      <PortfolioIcon name="external-link" size={20} />
                    </a>
                    <a href="#" className="project-link" title="View Code">
                      <PortfolioIcon name="github" size={20} />
                    </a>
                  </div>
                </div>

                <div className="project-placeholder">
                  <PortfolioIcon name={card.placeholderIconClass} size={48} />
                </div>
              </div>

              <div className="project-content">
                <h3 className="project-title">{pickMaybeI18n(card.title as any, lang)}</h3>
                <p className="project-description">{pickMaybeI18n(card.description as any, lang)}</p>
                <div className="project-tags">
                  {card.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
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
