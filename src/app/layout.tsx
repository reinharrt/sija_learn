// ============================================
// src/app/layout.tsx
// Root Layout - Main application layout
// ============================================

// ============================================ 
// src/app/layout.tsx 
// Root Layout - Main application layout 
// ============================================ 
 
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'SIJA Learn - Platform Pembelajaran SIJA',
  description: 'Platform repositori materi digital dan pusat informasi untuk siswa jurusan SIJA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}