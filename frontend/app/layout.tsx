import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Tetap gunakan Inter
import "./globals.css";

// 2. Konfigurasi Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Ini variabel untuk CSS
});

export const metadata: Metadata = {
  title: "Helphin - Buat Akun Prodi", // Bisa kamu ganti judulnya sekalian
  description: "Halaman pendaftaran prodi Helphin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        /* 3. GANTI BAGIAN INI: Gunakan inter.className agar font Inter aktif global */
        /* Hapus geistSans dan geistMono dari sini */
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}