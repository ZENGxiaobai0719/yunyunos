"use client";

import { useMemo, useState } from "react";
import type { Lang } from "../../lib/lang";
import { pickMaybeI18n } from "../../lib/lang";
import type { PortfolioContent } from "../../lib/portfolioData";
import PortfolioIcon from "./PortfolioIcon";

export default function ContactSection(props: { lang: Lang; content: PortfolioContent["contact"] }) {
  const { lang, content } = props;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const placeholders = useMemo(() => content.form.placeholders, [content.form.placeholders]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = pickMaybeI18n(content.form.successMessage as any, lang);
    alert(success);

    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-number">05</span>
          <h2 className="section-title">
            <span className="title-bracket">&lt;</span>
            <span className="title-text">{pickMaybeI18n(content.title as any, lang)}</span>
            <span className="title-bracket">/&gt;</span>
          </h2>
          <div className="section-line" />
        </div>

        <div className="contact-content">
          <div className="contact-info">
            {content.items.map((item) => {
              const label = pickMaybeI18n(item.label as any, lang);
              return (
                <div className="contact-item" key={item.value}>
                  <div className="contact-icon">
                    <PortfolioIcon name={item.iconClass} size={24} />
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-label">{label}</h4>
                    {item.href ? (
                      <a href={item.href} className="contact-value">
                        {item.value}
                      </a>
                    ) : (
                      <span className="contact-value">{item.value}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <form className="contact-form" id="contactForm" onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder={pickMaybeI18n(placeholders.name as any, lang)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                placeholder={pickMaybeI18n(placeholders.email as any, lang)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder={pickMaybeI18n(placeholders.subject as any, lang)}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                className="form-input form-textarea"
                rows={5}
                placeholder={pickMaybeI18n(placeholders.message as any, lang)}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-submit">
              <span>{pickMaybeI18n(content.form.submit as any, lang)}</span>
              <PortfolioIcon name="send" size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
