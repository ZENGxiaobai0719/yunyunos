import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunLearn Academy - Interactive Coding for Kids",
  description: "A playful educational platform where kids learn coding through gamified courses, real-time progress tracking, and dedicated mentorship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" dir="ltr">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;800&family=Nunito:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="body-main" data-theme="light" data-lang="zh" data-dir="ltr">
        {children}
      </body>
    </html>
  );
}
