import type { Lang } from "../../lang";
import { pickText } from "../../lang";
import type { PortfolioContent } from "../../portfolioData";

export default function FooterSection(props: { lang: Lang; content: PortfolioContent["footer"] }) {
  const { lang, content } = props;
  return (
    <footer className="user-main-footer">
      <div className="user-footer-container">
        <div className="user-footer-content">
          <div className="user-footer-text-wrapper">
            <p className="user-footer-text">
              <span className="user-footer-copyright">{content.copyright}</span>
              <span className="user-footer-divider">•</span>
              <span className="user-footer-built">{pickText(content.builtWith, lang)}</span>
            </p>
            <p className="user-footer-author">
              <span className="user-footer-by-text">{pickText(content.by, lang)}</span>
              <span>{content.authorName}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
