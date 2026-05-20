"use client";

import type { Lang } from "../../lib/lang";
import type { PortfolioNavItem } from "../../lib/portfolioData";
import PortfolioIcon from "./PortfolioIcon";

type Theme = "dark" | "light";

function isSameSection(hrefId: string, activeSection: string) {
  return hrefId === activeSection;
}

export default function TopNav(props: {
  nav: PortfolioNavItem[];
  lang: Lang;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  activeSection: string;
  onNavigate: (id: string) => void;
  isHeaderScrolled: boolean;
}) {
  const {
    nav,
    lang,
    onToggleLang,
    theme,
    onToggleTheme,
    isMenuOpen,
    onToggleMenu,
    activeSection,
    onNavigate,
    isHeaderScrolled
  } = props;

  return (
    <header className={`main-header ${isHeaderScrolled ? "scrolled" : ""}`} id="header">
      <nav className="nav-container">
        <div className="nav-brand">
          <div className="brand-logo">
            <span className="logo-bracket">&lt;</span>
            <span className="logo-text">Bian</span>
            <span className="logo-bracket">/&gt;</span>
          </div>
        </div>

        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`} id="navMenu">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${isSameSection(item.id, activeSection) ? "active" : ""}`}
              data-section={item.id}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
            >
              <PortfolioIcon name={item.iconClass} size={18} />
              <span className="nav-text">{lang === "zh" ? item.label.zh : item.label.en}</span>
            </a>
          ))}
        </div>

        <div className="nav-controls">
          <button
            className="lang-toggle"
            id="langToggle"
            type="button"
            title="Toggle Language"
            onClick={onToggleLang}
          >
            <PortfolioIcon name="languages" size={18} />
            <span className="lang-text">{lang === "en" ? "EN" : "中文"}</span>
          </button>

          <button
            className="theme-toggle"
            id="themeToggle"
            type="button"
            title="Toggle Theme"
            onClick={onToggleTheme}
          >
            <PortfolioIcon name={theme === "dark" ? "moon" : "sun"} size={18} />
          </button>

          <button
            className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
            id="menuToggle"
            type="button"
            title="Toggle Menu"
            onClick={onToggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}
