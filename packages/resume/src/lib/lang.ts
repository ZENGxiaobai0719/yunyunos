export type Lang = "zh" | "en";

export type I18nText = {
  zh: string;
  en: string;
};

export const STORAGE_LANG_KEY = "portfolio-lang";
export const STORAGE_THEME_KEY = "portfolio-theme";

export function pickText(text: I18nText, lang: Lang) {
  return lang === "zh" ? text.zh : text.en;
}

export function pickMaybeI18n(text: I18nText | string, lang: Lang) {
  if (typeof text === "string") return text;
  return pickText(text, lang);
}
