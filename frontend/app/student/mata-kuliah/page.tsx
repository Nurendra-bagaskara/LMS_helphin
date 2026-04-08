"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Clock, Users, Pin } from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

interface MataKuliah {
  id: string;
  name: string;
  coverUrl?: string | null;
  prodiId: string;
  prodiName?: string;
  materialCount?: number;
  isPinned?: boolean;
}

export default function StudentMataKuliahPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Student");
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [searchMatkul, setSearchMatkul] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get user name
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name?.split(" ")[0] || "Student");
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    // 2. Fetch all courses for the student's prodi
    const fetchMataKuliah = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Note: Students fetching from /api/mata-kuliah will typically only get
        // courses available for their prodi based on backend RBAC filtering.
        // We can also fetch from dashboard stats if needed, but let's use the standard API.
        const res = await fetch("http://localhost:8000/api/mata-kuliah", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.data)) {
          setMataKuliahList(data.data);
        } else if (data.success && Array.isArray(data.data)) {
          setMataKuliahList(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMataKuliah();
  }, []);

  const handleTogglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent card click
    console.log(`[PIN DEBUG] Click detected for course ID: ${id}`);
    
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("[PIN DEBUG] No token found");
        return;
      }

      // OPTIMISTIC UPDATE: Update UI instantly
      let previousState = false;
      setMataKuliahList(prev => prev.map(mk => {
        if (mk.id === id) {
          previousState = !!mk.isPinned;
          return { ...mk, isPinned: !previousState };
        }
        return mk;
      }));

      const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}/pin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("[PIN DEBUG] Response:", data);

      if (!data.success) {
        // REVERT if server failed
        console.error("[PIN DEBUG] Toggle failed:", data.message);
        setMataKuliahList(prev => prev.map(mk => 
          mk.id === id ? { ...mk, isPinned: previousState } : mk
        ));
      }
    } catch (err) {
      console.error("[PIN DEBUG] Network error:", err);
      // REVERT if network failed - we'll re-fetch in real apps, for now just simple revert
    }
  };

  const filteredMatkul = mataKuliahList
    .filter((mk) => mk.name.toLowerCase().includes(searchMatkul.toLowerCase()))
    .sort((a, b) => {
      // 1. Sort by pin status (pinned first)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 2. Secondary sort by name
      return a.name.localeCompare(b.name);
    });

  const firstName = userName.split(" ")[0];

  return (
    <div className="flex flex-col gap-6 p-4 mt-2">
      {/* Welcome Banner */}
      <div className="relative w-full h-[160px] md:h-[180px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#0055FF] to-[#07A3F9] shadow-sm flex items-center">
        <div className="relative z-10 pl-6 md:pl-8 text-white max-w-md">
          <h1 className="text-2xl md:text-[28px] font-extrabold mb-1 drop-shadow-sm">Hallo, {firstName} 👋</h1>
          <p className="text-sm md:text-xl font-bold opacity-90 drop-shadow-sm">Mata Kuliah Program Studi</p>
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
            alt="Gedung"
            fill
            className="object-cover object-left"
            priority
          />
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-[#068DFF] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Cari mata kuliah berdasarkan nama atau kode..."
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#068DFF]/20 dark:focus:ring-blue-900/20 focus:border-[#068DFF] dark:focus:border-blue-600 outline-none transition-all text-sm font-medium text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-600"
          value={searchMatkul}
          onChange={(e) => setSearchMatkul(e.target.value)}
        />
        {searchMatkul && (
          <button
            onClick={() => setSearchMatkul("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <div className="w-5 h-5 flex items-center justify-center">✕</div>
          </button>
        )}
      </div>

      {/* Mata Kuliah Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Daftar Mata Kuliah</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[140px] rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredMatkul.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {filteredMatkul.map((mk) => (
              <div
                key={mk.id}
                onClick={() => router.push(`/student/mata-kuliah/${mk.id}`)}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl dark:hover:border-blue-900/50 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col cursor-pointer"
              >
                {/* Cover Image */}
                <div className="relative w-full h-[150px] bg-[#0044CC] dark:bg-blue-950 overflow-hidden flex-shrink-0 transition-colors duration-300">
                  <Image
                    src="/Assets/bg_matkul.png"
                    alt="Pattern"
                    fill
                    className="object-cover opacity-70"
                  />
                  {mk.coverUrl ? (
                    <img
                      src={mk.coverUrl}
                      alt={mk.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 dark:bg-white/5 -translate-y-10 translate-x-10" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 dark:bg-white/5 -translate-x-6 translate-y-6" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <BookOpen size={72} className="text-white" />
                      </div>
                    </>
                  )}
                  {/* Pin Button */}
                  <button
                    onClick={(e) => handleTogglePin(e, mk.id)}
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-20 ${
                      mk.isPinned
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110"
                        : "bg-white/20 text-white/70 hover:bg-white/40 hover:text-white border border-white/20"
                    }`}
                  >
                    <Pin size={14} className={mk.isPinned ? "fill-white" : ""} />
                  </button>

                  {/* Prodi badge */}
                  {mk.prodiName && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-[10px] font-bold text-[#0055FF] dark:text-blue-400 rounded-full shadow-sm">
                        {mk.prodiName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 leading-tight line-clamp-2 mb-3 group-hover:text-[#0055FF] dark:group-hover:text-blue-400 transition-colors">
                    {mk.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-50 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
                      <BookOpen size={13} className="text-gray-300 dark:text-slate-600" />
                      <span className="text-[11px] font-semibold">{mk.materialCount || 0} Konten</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-[#0055FF] dark:group-hover:bg-blue-600 transition-colors duration-300">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 dark:text-blue-500 group-hover:text-white transition-colors">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={30} className="text-blue-400" />
            </div>
            <h3 className="text-gray-700 font-bold text-lg mb-1">Mata kuliah tidak ditemukan</h3>
            <p className="text-gray-400 text-sm">Tidak ada hasil untuk pencarian "{searchMatkul}"</p>
          </div>
        )}
      </div>

      <FooterDashboard />
    </div>
  );
}
