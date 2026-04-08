import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Tetap gunakan Inter
import "./globals.css";

import { ThemeProvider } from "../context/ThemeContext";

// 2. Konfigurasi Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Ini variabel untuk CSS
});

export const metadata: Metadata = {
  title: "Helphin - Platform Pembelajaran Digital",
  description: "Platform pembelajaran inovatif untuk mahasiswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}