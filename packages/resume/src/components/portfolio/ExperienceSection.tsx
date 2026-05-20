"use client";

import type { Lang } from "../../lib/lang";
import { pickMaybeI18n } from "../../lib/lang";
import type { PortfolioContent } from "../../lib/portfolioData";
import PortfolioIcon from "./PortfolioIcon";

function renderTimelineText(value: unknown, lang: Lang) {
  return pickMaybeI18n(value as any, lang);
}

export default function ExperienceSection(props: { lang: Lang; content: PortfolioContent["experience"] }) {
  const { lang, content } = props;

  return (
    <section id="experience" className="section experience-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-number">03</span>
          <h2 className="section-title">
            <span className="title-bracket">&lt;</span>
            <span className="title-text">{pickMaybeI18n(content.title, lang)}</span>
            <span className="title-bracket">/&gt;</span>
          </h2>
          <div className="section-line" />
        </div>

        <div className="timeline">
          {content.items.map((item, idx) => {
            const badge = pickMaybeI18n(item.badge as any, lang);
            const hasBadge = typeof item.badge === "string" ? item.badge.trim() !== "" : true;
            return (
              <div className="timeline-item" key={idx}>
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <div className="timeline-year">{renderTimelineText(item.year as any, lang)}</div>
                    {hasBadge ? <div className="timeline-badge">{badge}</div> : null}
                  </div>

                  <h3 className="timeline-title">{renderTimelineText(item.title as any, lang)}</h3>

                  <div className="timeline-company">
                    <PortfolioIcon name="building" size={16} />
                    {item.company}
                  </div>

                  <p className="timeline-description">{renderTimelineText(item.description as any, lang)}</p>

                  <div className="timeline-achievements">
                    {item.achievements.map((ach, aIdx) => (
                      <div className="achievement-item" key={aIdx}>
                        <PortfolioIcon name="check-circle" size={16} />
                        <span>{pickMaybeI18n(ach as any, lang)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="timeline-tags">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
