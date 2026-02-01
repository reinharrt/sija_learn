// ============================================
// src/app/layout.tsx
// Root Layout - Neobrutalist Theme WITH GAMIFICATION
// ============================================

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Configure Poppins font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SIJA Learn - Digital Learning Hub',
  description: 'Platform repositori materi digital dan pusat informasi untuk siswa jurusan Sistem Informatika, Jaringan dan Aplikasi - SMKN 1 Cimahi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-grid-pattern font-poppins antialiased selection:bg-sija-primary selection:text-white">
        <AuthProvider>
          <GamificationProvider>
            <Header />
            <main className="min-h-screen pt-24">
              {children}
            </main>
            <Footer />
          </GamificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}