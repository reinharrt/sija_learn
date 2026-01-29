'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t-4 border-black pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="md:col-span-5">
            <div className="inline-block border-2 border-black px-3 py-1 bg-sija-primary mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <h3 className="text-2xl font-black tracking-tighter">SIJA.ID</h3>
            </div>
            <p className="font-bold text-lg leading-tight mb-6 max-w-xs">
              Platform belajar anak SIJA SMKN 1 Cimahi. <br/> 
              Simple, lugas, dan terarah.
            </p>
            {/* Social Media - Cleaner Version */}
            <div className="flex gap-3">
              {['IG', 'GH', 'YT'].map((item) => (
                <button key={item} className="h-10 w-10 border-2 border-black flex items-center justify-center font-bold hover:bg-sija-primary transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <div className="md:col-span-3">
            <h4 className="font-black uppercase mb-6 text-sm tracking-widest">Materi</h4>
            <ul className="space-y-3 font-bold text-gray-700">
              <li><Link href="/courses" className="hover:text-black hover:underline decoration-2">Semua Kursus</Link></li>
              <li><Link href="/articles" className="hover:text-black hover:underline decoration-2">Artikel Terbaru</Link></li>
              <li><Link href="/handbook" className="hover:text-black hover:underline decoration-2">Buku Saku</Link></li>
            </ul>
          </div>

          {/* Newsletter / Info */}
          <div className="md:col-span-4">
            <h4 className="font-black uppercase mb-6 text-sm tracking-widest">Stay Updated</h4>
            <div className="flex border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <input 
                type="email" 
                placeholder="Email kamu..." 
                className="w-full p-2 font-bold outline-none"
              />
              <button className="bg-sija-primary border-l-2 border-black px-4 font-black uppercase text-xs hover:bg-yellow-300 transition-colors">
                Sub
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-black flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-bold text-sm italic">
            &copy; {new Date().getFullYear()} Kelompok 5 SIJA.
          </p>
          <div className="flex gap-4 font-black text-[10px] uppercase tracking-widest">
            <span className="bg-black text-white px-2 py-0.5">SMKN 1 Cimahi</span>
            <span className="border-2 border-black px-2 py-0.5">V.1.0-2024</span>
          </div>
        </div>
      </div>
    </footer>
  );
}