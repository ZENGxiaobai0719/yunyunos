"use client";

import type { Lang } from "../../lib/lang";
import { pickText } from "../../lib/lang";
import type { PortfolioContent } from "../../lib/portfolioData";

export default function SkillsSection(props: { lang: Lang; content: PortfolioContent["skills"] }) {
  const { lang, content } = props;

  return (
    <section id="skills" className="section skills-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-number">02</span>
          <h2 className="section-title">
            <span className="title-bracket">&lt;</span>
            <span className="title-text">{pickText(content.title, lang)}</span>
            <span className="title-bracket">/&gt;</span>
          </h2>
          <div className="section-line" />
        </div>

        <div className="skills-grid">
          {content.categories.map((cat) => (
            <div className="skill-category" key={cat.title.en}>
              <h3 className="category-title">{pickText(cat.title, lang)}</h3>
              <div className="skill-items">
                {cat.items.map((skill) => (
                  <div
                    className="skill-item"
                    key={skill.name}
                    data-skill={skill.name}
                    data-percent={skill.percent}
                  >
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percent">0%</span>
                    </div>
                    <div className="skill-bar">
                      <div className="skill-progress" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
