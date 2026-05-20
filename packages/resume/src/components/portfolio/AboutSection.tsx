"use client";

import type { Lang } from "../../lib/lang";
import { pickText } from "../../lib/lang";
import type { PortfolioContent } from "../../lib/portfolioData";

export default function AboutSection(props: { lang: Lang; content: PortfolioContent["about"] }) {
  const { lang, content } = props;
  return (
    <section id="about" className="section about-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-number">01</span>
          <h2 className="section-title">
            <span className="title-bracket">&lt;</span>
            <span className="title-text">{pickText(content.title, lang)}</span>
            <span className="title-bracket">/&gt;</span>
          </h2>
          <div className="section-line" />
        </div>

        <div className="about-content">
          <div className="about-text-wrapper">
            <div className="about-intro">
              <p className="about-text">{pickText(content.intro, lang)}</p>
            </div>

            <div className="about-stats">
              {content.tags.map((tag) => (
                <div className="stat-item stat-tag" key={tag.text.en}>
                  <div className="stat-tag-text">{pickText(tag.text, lang)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-image-wrapper">
            <div className="about-image-container">
              <div className="code-block">
                <div className="code-line">
                  <span className="code-keyword">const</span>{" "}
                  <span className="code-variable">developer</span>
                  <span className="code-operator">=</span>
                  <span className="code-brace">{"{"}</span>
                </div>
                <div className="code-line indent">
                  <span className="code-property">name</span>
                  <span className="code-operator">:</span>
                  <span className="code-string">'Developer'</span>
                  <span className="code-comma">,</span>
                </div>
                <div className="code-line indent">
                  <span className="code-property">skills</span>
                  <span className="code-operator">:</span>
                  <span className="code-bracket">[</span>
                  <span className="code-string">'React'</span>
                  <span className="code-comma">,</span>
                  <span className="code-string">'Node.js'</span>
                  <span className="code-comma">,</span>
                  <span className="code-string">'TypeScript'</span>
                  <span className="code-bracket">]</span>
                  <span className="code-comma">,</span>
                </div>
                <div className="code-line indent">
                  <span className="code-property">passion</span>
                  <span className="code-operator">:</span>
                  <span className="code-string">'Coding'</span>
                </div>
                <div className="code-line">
                  <span className="code-brace">{"}"}</span>
                  <span className="code-semicolon">;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
