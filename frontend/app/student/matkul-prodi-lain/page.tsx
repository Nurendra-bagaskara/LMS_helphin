"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

interface ProdiItem {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
}

export default function StudentMatkulProdiLain() {
  const [userName, setUserName] = useState("Student");
  const [prodiList, setProdiList] = useState<ProdiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fakultasName, setFakultasName] = useState("Fakultas Informatika");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) setUserName(user.name.split(" ")[0]);
      } catch { }
    }

    fetchProdiData();
  }, []);

  const fetchProdiData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) return;

      const user = JSON.parse(userStr);
      if (!user.prodiId) return;

      // 1. Dapatkan detail Prodi asal student
      const userProdiRes = await fetch(`http://localhost:8000/api/prodi/${user.prodiId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userProdiData = await userProdiRes.json();

      if (userProdiData.success) {
        if (userProdiData.data?.fakultasName) {
          setFakultasName(userProdiData.data.fakultasName);
        }

        if (userProdiData.data?.fakultasId) {
          const fakultasId = userProdiData.data.fakultasId;

          const res = await fetch(`http://localhost:8000/api/prodi?fakultasId=${fakultasId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();

          if (data.success && Array.isArray(data.data)) {
            const filteredProdi = data.data.filter((p: ProdiItem) => p.id !== user.prodiId);
            setProdiList(filteredProdi);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch Prodi", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] dark:bg-slate-950 ${inter.className} pb-10 flex flex-col gap-6 transition-colors duration-300`}>
      {/* ── HERO BANNER ── */}
      <div className="relative w-full h-[160px] md:h-[180px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#0055FF] to-[#07A3F9] shadow-sm flex items-center mx-4 mt-4" style={{ maxWidth: "calc(100% - 2rem)" }}>
        <div className="relative z-10 pl-6 md:pl-8 text-white max-w-md">
          <h1 className="text-2xl md:text-[28px] font-extrabold mb-1 drop-shadow-sm">Hallo, {userName} 👋</h1>
          <p className="text-sm md:text-xl font-bold opacity-90 drop-shadow-sm">{fakultasName}</p>
          <p className="text-[11px] md:text-xs font-medium opacity-75 mt-1 tracking-wide">by helPhin</p>
        </div>
        <div 
          className="absolute right-0 top-0 h-full w-[45%] z-0 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)'
          }}
        >
          <Image
            src="/Assets/gedung_kampus_image.png"
            alt="Gedung Kampus"
            fill
            className="object-cover object-left"
            priority
          />
        </div>
      </div>

      {/* ── PRODI GRID ── */}
      <section className="px-6 flex flex-col gap-6 max-w-[1400px] mx-auto w-full mt-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Prodi</h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : prodiList.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {prodiList.map((prodi) => (
              <Link
                key={prodi.id}
                href={`/student/matkul-prodi-lain/${prodi.id}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl dark:hover:border-blue-900/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Logo/Image area */}
                <div className="relative w-full h-[140px] bg-gradient-to-br from-[#0055FF] to-[#068DFF] dark:from-[#0044CC] dark:to-[#056CC0] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {prodi.logoUrl ? (
                    <img
                      src={prodi.logoUrl}
                      alt={prodi.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 -translate-x-6 translate-y-6" />
                      {/* Prodi initial */}
                      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-2xl">
                          {prodi.name.charAt(0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1 text-center">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-slate-200 leading-tight line-clamp-2 mb-2 group-hover:text-[#0055FF] dark:group-hover:text-blue-400 transition-colors">
                    {prodi.name}
                  </h4>
                  <div className="mt-auto flex items-center justify-center pt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-[#0055FF] dark:group-hover:bg-blue-600 transition-colors duration-300">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 dark:text-blue-400 group-hover:text-white transition-colors">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
            Tidak ada Prodi tersedia saat ini.
          </div>
        )}
      </section>

      <div className="mt-auto px-6">
        <FooterDashboard />
      </div>
    </div>
  );
}
