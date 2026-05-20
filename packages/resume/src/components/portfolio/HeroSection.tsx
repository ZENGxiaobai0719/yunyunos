"use client";

import type { Lang } from "../../lib/lang";
import { pickText } from "../../lib/lang";
import type { PortfolioContent } from "../../lib/portfolioData";
import PortfolioIcon from "./PortfolioIcon";

export default function HeroSection(props: { lang: Lang; content: PortfolioContent["hero"] }) {
  const { lang, content } = props;
  return (
    <section id="home" className="hero-section">
      <div className="hero-background">
        <div className="code-grid-bg" />
        <div className="floating-particles" id="particles" />
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-greeting">
            <span className="greeting-text">{pickText(content.greeting, lang)}</span>
            <span className="greeting-cursor">|</span>
          </div>

          <h1 className="hero-name" id="heroName">
            <span className="name-prefix">const</span>
            <span className="name-operator">=</span>
            <span className="name-value">Bian</span>
            <span className="name-suffix">;</span>
          </h1>

          <div className="hero-title">
            <span className="title-prefix">//</span>
            <span className="title-text">{pickText(content.title, lang)}</span>
          </div>

          <p className="hero-description">{pickText(content.description, lang)}</p>

          <div className="hero-buttons">
            <a href="#contact" className="btn btn-primary">
              <span>{pickText(content.ctaPrimary, lang)}</span>
              <PortfolioIcon name="arrow-right" size={18} />
            </a>
            <a href="#projects" className="btn btn-secondary">
              <span>{pickText(content.ctaSecondary, lang)}</span>
              <PortfolioIcon name="code" size={18} />
            </a>
          </div>

          <div className="hero-social">
            <a href="#" className="social-icon" title="GitHub">
              <PortfolioIcon name="github" size={20} />
            </a>
            <a href="#" className="social-icon" title="LinkedIn">
              <PortfolioIcon name="linkedin" size={20} />
            </a>
            <a href="#" className="social-icon" title="Twitter">
              <PortfolioIcon name="twitter" size={20} />
            </a>
            <a href="#" className="social-icon" title="CodePen">
              <PortfolioIcon name="codepen" size={20} />
            </a>
            <a href="#" className="social-icon" title="Email">
              <PortfolioIcon name="mail" size={20} />
            </a>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-image-container">
            <div className="profile-image-glow" />
            <div className="profile-image-frame">
              <div className="profile-image" id="profileImage">
                <div className="profile-placeholder">
                  <PortfolioIcon name="code" size={48} />
                </div>
              </div>
            </div>
            <div className="floating-badge badge-1">
              <PortfolioIcon name="react" size={24} />
              <div className="badge-content">
                <span className="badge-title">React</span>
                <span className="badge-libs">Next.js, Hooks, Redux</span>
              </div>
            </div>
            <div className="floating-badge badge-2">
              <PortfolioIcon name="code" size={24} />
              <div className="badge-content">
                <span className="badge-title">Agent</span>
                <span className="badge-libs">AI Agent, LLM, RAG</span>
              </div>
            </div>
            <div className="floating-badge badge-3">
              <PortfolioIcon name="terminal" size={24} />
              <div className="badge-content">
                <span className="badge-title">Java</span>
                <span className="badge-libs">Spring Boot, MyBatis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span className="scroll-text">{lang === "zh" ? "向下滚动" : "Scroll Down"}</span>
      </div>
    </section>
  );
}
