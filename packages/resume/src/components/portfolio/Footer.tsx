"use client";

import type { Lang } from "../../lib/lang";
import { pickText } from "../../lib/lang";
import type { PortfolioContent } from "../../lib/portfolioData";
import PortfolioIcon from "./PortfolioIcon";

export default function Footer(props: { lang: Lang; content: PortfolioContent["footer"] }) {
  const { lang, content } = props;
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-text-wrapper">
            <p className="footer-text">
              <span className="footer-copyright">{content.copyright}</span>
              <span className="footer-divider">•</span>
              <span className="footer-built">{pickText(content.builtWith, lang)}</span>
            </p>
            <p className="footer-author">
              <span className="footer-by-text">{pickText(content.by, lang)}</span>
              <a
                href="https://www.linkedin.com/in/mohammad-abu-sakour-kn"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-author-link"
              >
                <PortfolioIcon name="code" size={16} />
                <span>{content.authorName}</span>
              </a>
            </p>
          </div>

          <div className="footer-social">
            <a
              href="https://www.linkedin.com/in/mohammad-abu-sakour-kn"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              <PortfolioIcon name="linkedin" size={18} />
            </a>
            <a href="#" className="footer-social-link" title="GitHub">
              <PortfolioIcon name="github" size={18} />
            </a>
            <a href="#" className="footer-social-link" title="Twitter">
              <PortfolioIcon name="twitter" size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
