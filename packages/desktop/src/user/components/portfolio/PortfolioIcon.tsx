import {
  Home,
  User,
  Code2,
  Briefcase,
  Rocket,
  Mail,
  Moon,
  Sun,
  Languages,
  Building2,
  CheckCircle2,
  ExternalLink,
  Send,
  Phone,
  MapPin,
  ShoppingCart,
  ListTodo,
  FileText,
  ArrowRight,
  Monitor,
  Link,
  Play,
  Terminal,
  type LucideIcon,
} from "lucide-react";

const lucideMap: Record<string, LucideIcon> = {
  home: Home,
  user: User,
  code: Code2,
  briefcase: Briefcase,
  rocket: Rocket,
  mail: Mail,
  moon: Moon,
  sun: Sun,
  languages: Languages,
  building: Building2,
  "check-circle": CheckCircle2,
  "external-link": ExternalLink,
  send: Send,
  phone: Phone,
  "map-pin": MapPin,
  "shopping-cart": ShoppingCart,
  tasks: ListTodo,
  blog: FileText,
  "arrow-right": ArrowRight,
  monitor: Monitor,
  link: Link,
  play: Play,
  terminal: Terminal,
};

function BrandIcon({ name }: { name: string }) {
  switch (name) {
    case "github":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "twitter":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "codepen":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.144 13.067v-2.69L22.22 12l-4.076 1.533v-2.69L23.842 12l-5.698 2.144v-2.134L24 12l-5.856-2.01v-1.98L24 12l-5.856-2.01V8.01L12 3.924 5.856 8.01v1.98L0 12l5.856 2.01v1.98L0 12l5.856 2.01v1.98L12 20.076l6.144-2.086v-1.98L24 12l-5.856-2.01v-2.134L12 5.99l-5.698 2.144v2.134L0 12l4.076 1.533v2.69L0 12l5.698 2.144v2.134L0 12l5.698 2.144v2.134L12 18.01l6.302-2.144v-2.134L24 12l-5.698-2.144v-2.134L12 5.99l-5.698 2.144v2.134L0 12l5.698 2.144v2.134L0 12l5.698 2.144v2.134L12 20.076l6.144-2.086z" />
        </svg>
      );
    case "react":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)" />
        </svg>
      );
    default:
      return null;
  }
}

export default function PortfolioIcon({ name, size = 20 }: { name: string; size?: number }) {
  const IconComponent = lucideMap[name];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  return <BrandIcon name={name} />;
}
