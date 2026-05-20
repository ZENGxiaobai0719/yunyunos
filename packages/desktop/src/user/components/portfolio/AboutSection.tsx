import type { Lang } from "../../lang";
import { pickText } from "../../lang";
import type { PortfolioContent } from "../../portfolioData";

export default function AboutSection(props: { lang: Lang; content: PortfolioContent["about"] }) {
  const { lang, content } = props;
  return (
    <section id="about" className="user-section user-about-section">
      <div className="user-section-container">
        <div className="user-section-header">
          <span className="user-section-number">01</span>
          <h2 className="user-section-title">
            <span className="user-title-bracket">&lt;</span>
            <span className="user-title-text">{pickText(content.title, lang)}</span>
            <span className="user-title-bracket">/&gt;</span>
          </h2>
          <div className="user-section-line" />
        </div>

        <div className="user-about-content">
          <div className="user-about-text-wrapper">
            <div className="user-about-intro">
              <p className="user-about-text">{pickText(content.intro, lang)}</p>
            </div>

            <div className="user-about-stats">
              {content.tags.map((tag) => (
                <div className="user-stat-item user-stat-tag" key={tag.text.en}>
                  <div className="user-stat-tag-text">{pickText(tag.text, lang)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="user-about-image-wrapper">
            <div className="user-about-image-container">
              <div className="user-code-block">
                <div className="user-code-line">
                  <span className="user-code-keyword">const</span>{" "}
                  <span className="user-code-variable">developer</span>
                  <span className="user-code-operator">=</span>
                  <span className="user-code-brace">{"{"}</span>
                </div>
                <div className="user-code-line user-indent">
                  <span className="user-code-property">name</span>
                  <span className="user-code-operator">:</span>
                  <span className="user-code-string">'Developer'</span>
                  <span className="user-code-comma">,</span>
                </div>
                <div className="user-code-line user-indent">
                  <span className="user-code-property">skills</span>
                  <span className="user-code-operator">:</span>
                  <span className="user-code-bracket">[</span>
                  <span className="user-code-string">'React'</span>
                  <span className="user-code-comma">,</span>
                  <span className="user-code-string">'Node.js'</span>
                  <span className="user-code-comma">,</span>
                  <span className="user-code-string">'TypeScript'</span>
                  <span className="user-code-bracket">]</span>
                  <span className="user-code-comma">,</span>
                </div>
                <div className="user-code-line user-indent">
                  <span className="user-code-property">passion</span>
                  <span className="user-code-operator">:</span>
                  <span className="user-code-string">'Coding'</span>
                </div>
                <div className="user-code-line">
                  <span className="user-code-brace">{"}"}</span>
                  <span className="user-code-semicolon">;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
