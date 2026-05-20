import { useState, useEffect, useCallback, useRef } from 'react'
import type { Lang } from './lang'
import { STORAGE_LANG_KEY, STORAGE_THEME_KEY } from './lang'
import { portfolioContent } from './portfolioData'
import TopNav from './components/portfolio/TopNav'
import HeroSection from './components/portfolio/HeroSection'
import AboutSection from './components/portfolio/AboutSection'
import SkillsSection from './components/portfolio/SkillsSection'
import ExperienceSection from './components/portfolio/ExperienceSection'
import ProjectsSection from './components/portfolio/ProjectsSection'
import ContactSection from './components/portfolio/ContactSection'
import FooterSection from './components/portfolio/FooterSection'
import './styles/portfolio.css'

const SECTION_IDS = ['home', 'about', 'skills', 'experience', 'projects', 'contact']

export default function PersonalWindow() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY)
    return saved === 'en' ? 'en' : 'zh'
  })
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY)
    return saved === 'light' ? 'light' : 'dark'
  })
  const [activeSection, setActiveSection] = useState('home')
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG_KEY, lang)
  }, [lang])

  useEffect(() => {
    localStorage.setItem(STORAGE_THEME_KEY, theme)
  }, [theme])

  // Track scroll for sticky header appearance and active section
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      setIsHeaderScrolled(el.scrollTop > 10)

      // Determine active section
      let current = 'home'
      for (const id of SECTION_IDS) {
        const section = el.querySelector(`#${id}`)
        if (!section) continue
        const rect = (section as HTMLElement).getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        if (rect.top <= elRect.top + 120) {
          current = id
        }
      }
      setActiveSection(current)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavigate = useCallback((id: string) => {
    const el = containerRef.current
    if (!el) return
    const section = el.querySelector(`#${id}`)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <div className="personal-window" ref={containerRef} data-pf-theme={theme}>
      <TopNav
        nav={portfolioContent.nav}
        lang={lang}
        onToggleLang={toggleLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isHeaderScrolled={isHeaderScrolled}
      />
      <HeroSection lang={lang} content={portfolioContent.hero} />
      <AboutSection lang={lang} content={portfolioContent.about} />
      <SkillsSection lang={lang} content={portfolioContent.skills} />
      <ExperienceSection lang={lang} content={portfolioContent.experience} />
      <ProjectsSection lang={lang} content={portfolioContent.projects} />
      <ContactSection lang={lang} content={portfolioContent.contact} />
      <FooterSection lang={lang} content={portfolioContent.footer} />
    </div>
  )
}
