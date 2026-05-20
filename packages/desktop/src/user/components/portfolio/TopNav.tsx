import type { Lang } from "../../lang";
import type { PortfolioNavItem } from "../../portfolioData";

type Theme = "dark" | "light";

export default function TopNav(props: {
  nav: PortfolioNavItem[];
  lang: Lang;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  activeSection: string;
  onNavigate: (id: string) => void;
  isHeaderScrolled: boolean;
}) {
  const { nav, lang, onToggleLang, theme, onToggleTheme, activeSection, onNavigate, isHeaderScrolled } = props;

  return (
    <header className={`user-main-header ${isHeaderScrolled ? "user-scrolled" : ""}`}>
      <nav className="user-nav-container">
        <div className="user-nav-brand">
          <div className="user-brand-logo">
            <span className="user-logo-bracket">&lt;</span>
            <span className="user-logo-text">Bian</span>
            <span className="user-logo-bracket">/&gt;</span>
          </div>
        </div>

        <div className="user-nav-menu">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`user-nav-link ${activeSection === item.id ? "user-active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
            >
              <span className="user-nav-text">{lang === "zh" ? item.label.zh : item.label.en}</span>
            </a>
          ))}
        </div>

        <div className="user-nav-controls">
          <button className="user-lang-toggle" type="button" title="Toggle Language" onClick={onToggleLang}>
            <span className="user-lang-text">{lang === "en" ? "EN" : "中文"}</span>
          </button>
          <button className="user-theme-toggle" type="button" title="Toggle Theme" onClick={onToggleTheme}>
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
