import { useState } from 'react'
import type { Lang } from '../../lang'
import { pickText } from '../../lang'
import type { PortfolioContent } from '../../portfolioData'
import PortfolioIcon from './PortfolioIcon'

export default function ContactSection(props: { lang: Lang; content: PortfolioContent['contact'] }) {
  const { lang, content } = props
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="contact" className="user-section user-contact-section">
      <div className="user-section-container">
        <div className="user-section-header">
          <span className="user-section-number">05</span>
          <h2 className="user-section-title">
            <span className="user-title-bracket">&lt;</span>
            <span className="user-title-text">{pickText(content.title, lang)}</span>
            <span className="user-title-bracket">/&gt;</span>
          </h2>
          <div className="user-section-line" />
        </div>

        <div className="user-contact-grid">
          <div className="user-contact-info-list">
            {content.items.map((item) => {
              const itemContent = (
                <>
                  <div className="user-contact-icon">
                    <PortfolioIcon name={item.iconClass} size={18} />
                  </div>
                  <div>
                    <div className="user-contact-label">{pickText(item.label, lang)}</div>
                    <div className="user-contact-value">{item.value}</div>
                  </div>
                </>
              )
              if (item.href) {
                return (
                  <a className="user-contact-info-item" href={item.href} key={item.label.en}>
                    {itemContent}
                  </a>
                )
              }
              return (
                <div className="user-contact-info-item" key={item.label.en}>
                  {itemContent}
                </div>
              )
            })}
          </div>

          <form className="user-contact-form" onSubmit={handleSubmit}>
            <div className="user-form-group">
              <input
                className="user-form-input"
                type="text"
                placeholder={pickText(content.form.placeholders.name, lang)}
                required
              />
            </div>
            <div className="user-form-group">
              <input
                className="user-form-input"
                type="email"
                placeholder={pickText(content.form.placeholders.email, lang)}
                required
              />
            </div>
            <div className="user-form-group">
              <input
                className="user-form-input"
                type="text"
                placeholder={pickText(content.form.placeholders.subject, lang)}
                required
              />
            </div>
            <div className="user-form-group">
              <textarea
                className="user-form-textarea"
                placeholder={pickText(content.form.placeholders.message, lang)}
                required
              />
            </div>
            <button className="user-form-submit" type="submit">
              {pickText(content.form.submit, lang)}
            </button>
            {sent && (
              <div className="user-form-success">{pickText(content.form.successMessage, lang)}</div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
