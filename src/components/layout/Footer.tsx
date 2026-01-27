// ============================================
// src/components/layout/Footer.tsx
// Footer Component - Page footer
// ============================================

'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">SIJA Learn</h3>
            <p className="text-gray-400 text-sm">
              Platform repositori materi digital dan pusat informasi untuk siswa jurusan SIJA.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/articles" className="text-gray-400 hover:text-white">
                  Artikel
                </a>
              </li>
              <li>
                <a href="/courses" className="text-gray-400 hover:text-white">
                  Course
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Kategori</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/articles?category=pelajaran" className="text-gray-400 hover:text-white">
                  Pelajaran
                </a>
              </li>
              <li>
                <a href="/articles?category=tech" className="text-gray-400 hover:text-white">
                  Tech
                </a>
              </li>
              <li>
                <a href="/articles?category=tutorial" className="text-gray-400 hover:text-white">
                  Tutorial
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} SIJA Learn - Kelompok 5. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
