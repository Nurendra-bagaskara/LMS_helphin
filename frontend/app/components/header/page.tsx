'use client';

import Image from 'next/image';

export const Navbar = () => {
  return (
    <header className="h-20 bg-transparent flex items-center justify-end px-12 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        {/* Ikon Dark Mode & Notifikasi */}
        <div className="flex items-center gap-4 text-gray-400">
          <button className="hover:text-gray-600 transition">
             {/* Ganti dengan SVG Figma jika perlu */}
            <Image
              src="/Assets/icons/moon.svg"
              alt="Moon"
              width={20}
              height={20}
            />
          </button>
          <button className="relative hover:text-gray-600 transition">
            <Image
              src="/Assets/icons/notification-bing.svg"
              alt="Notification"
              width={20}
              height={20}
            />
            {/* Dot Notifikasi Kuning/Merah jika ada */}
            <Image
              src="/Assets/icons/Frame 52786.svg"
              alt="Dot"
              width={10}
              height={10}
              className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white"
            />
          </button>
        </div>

        {/* User Profile Area */}
        <div className="flex items-center gap-3 ml-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800 leading-tight">nexta</p>
            <p className="text-[11px] text-gray-400 font-medium">nexta.edu@gmail.com</p>
          </div>
          
          {/* Foto Profil 40x40 sesuai Figma */}
          <div className="relative w-10 h-10 (40px) rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <Image 
              src="/images/profile-admin.png" 
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Ikon Dropdown Kecil */}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-gray-400">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </header>
  );
};