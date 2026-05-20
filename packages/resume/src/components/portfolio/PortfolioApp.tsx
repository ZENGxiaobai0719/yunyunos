"use client";

import { useEffect, useMemo, useState } from "react";
import LoaderScreen from "./LoaderScreen";
import TopNav from "./TopNav";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import SkillsSection from "./SkillsSection";
import ExperienceSection from "./ExperienceSection";
import ProjectsSection from "./ProjectsSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import { initPortfolioAnimations } from "../../lib/portfolioAnimations";
import { STORAGE_LANG_KEY, STORAGE_THEME_KEY, type Lang } from "../../lib/lang";
import { portfolioContent, type PortfolioContent } from "../../lib/portfolioData";

type Theme = "dark" | "light";

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    // ignore
  }

  if (typeof navigator !== "undefined") {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("zh")) return "zh";
  }

  return "en";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // ignore
  }

  return "dark";
}

function setHtmlAndBodyLang(lang: Lang) {
  const html = document.documentElement;
  const body = document.body;
  html.lang = lang === "zh" ? "zh" : "en";
  html.dir = "ltr";
  body.dataset.lang = lang;
  body.dataset.dir = "ltr";
}

export default function PortfolioApp() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const content: PortfolioContent = portfolioContent;

  useEffect(() => {
    setLang(getInitialLang());
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    setHtmlAndBodyLang(lang);

    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [lang, theme]);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 50;
      setIsHeaderScrolled(next);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = content.nav.map((i) => i.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!visible) return;
        setActiveSection((visible.target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.2, 0.3] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [content.nav]);

  useEffect(() => {
    initPortfolioAnimations();
  }, []);

  const onNavigate = (id: string) => {
    setIsMenuOpen(false);
    const target = document.getElementById(id);
    if (!target) return;

    const headerHeight = document.querySelector(".main-header")?.clientHeight ?? 80;
    const targetPosition = target.offsetTop - headerHeight;

    window.scrollTo({ top: targetPosition, behavior: "smooth" });
    setActiveSection(id);
  };

  const onToggleLang = () => setLang((prev) => (prev === "zh" ? "en" : "zh"));
  const onToggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const nav = useMemo(() => content.nav, [content.nav]);

  return (
    <div>
      <LoaderScreen />

      <TopNav
        nav={nav}
        lang={lang}
        onToggleLang={onToggleLang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((v) => !v)}
        activeSection={activeSection}
        onNavigate={onNavigate}
        isHeaderScrolled={isHeaderScrolled}
      />

      <main className="main-content">
        <HeroSection lang={lang} content={content.hero} />
        <AboutSection lang={lang} content={content.about} />
        <SkillsSection lang={lang} content={content.skills} />
        <ExperienceSection lang={lang} content={content.experience} />
        <ProjectsSection lang={lang} content={content.projects} />
        <ContactSection lang={lang} content={content.contact} />
      </main>

      <Footer lang={lang} content={content.footer} />
    </div>
  );
}
