"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

interface MataKuliah {
  id: string;
  name: string;
  coverUrl?: string | null;
  prodiId: string;
  prodiName?: string;
  materialCount?: number;
}

export default function MatkulProdiLainDetail() {
  const params = useParams();
  const router = useRouter();
  const prodiId = params?.id as string;

  const [prodiName, setProdiName] = useState("Program Studi");
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [searchMatkul, setSearchMatkul] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [prodiId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // 1. Fetch nama prodi
      const prodiRes = await fetch(`http://localhost:8000/api/prodi/${prodiId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prodiData = await prodiRes.json();
      if (prodiData.success && prodiData.data?.name) {
        setProdiName(prodiData.data.name);
      }

      // 2. Fetch mata kuliah berdasarkan prodiId
      const mkRes = await fetch(`http://localhost:8000/api/mata-kuliah?prodiId=${prodiId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mkData = await mkRes.json();
      if ((mkData.success || mkData.status === "success") && Array.isArray(mkData.data)) {
        setMataKuliahList(mkData.data);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatkul = mataKuliahList.filter(
    (mk) => mk.name.toLowerCase().includes(searchMatkul.toLowerCase())
  );

  return (
    <div className={`flex flex-col gap-6 p-4 mt-2 min-h-screen ${inter.className}`}>
      {/* Banner */}
      <div className="relative w-full h-[160px] md:h-[180px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#0055FF] to-[#07A3F9] shadow-sm flex items-center">
        <div className="relative z-10 pl-6 md:pl-8 text-white max-w-md">
          <button
            onClick={() => router.push("/student/matkul-prodi-lain")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-2 text-sm font-medium transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            Kembali ke Prodi Lain
          </button>
          <h1 className="text-2xl md:text-[28px] font-extrabold mb-1 drop-shadow-sm text-white">Mata Kuliah {prodiName}</h1>
          <p className="text-[11px] md:text-xs font-medium opacity-75 mt-1 tracking-wide text-white/80">by helPhin</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-[55%] md:w-[45%] z-0">
          <Image
            src="/Assets/gedung_kampus_image.png"
            alt="Gedung Kampus"
            fill
            className="object-cover object-left"
            priority
          />
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#07A3F9] to-transparent" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-[#068DFF] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Cari mata kuliah berdasarkan nama atau kode..."
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-910 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#068DFF]/20 dark:focus:ring-blue-900/20 focus:border-[#068DFF] dark:focus:border-blue-600 outline-none transition-all text-sm font-medium text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-600"
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

      {/* Daftar Mata Kuliah */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Daftar Mata Kuliah</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[140px] rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredMatkul.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {filteredMatkul.map((mk) => (
              <button
                key={mk.id}
                onClick={() => router.push(`/student/matkul-prodi-lain/${prodiId}/matkul/${mk.id}`)}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl dark:hover:border-blue-900/50 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col"
              >
                {/* Cover Image */}
                <div className="relative w-full h-[150px] bg-[#0044CC] dark:bg-blue-950 overflow-hidden flex-shrink-0 transition-colors duration-300">
                  <Image
                    src="/Assets/bg_matkul.png"
                    alt="Pattern"
                    fill
                    className="object-cover opacity-20"
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
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 leading-tight line-clamp-2 mb-3 group-hover:text-[#0055FF] dark:group-hover:text-blue-400 transition-colors">
                    {mk.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between border-t border-gray-50 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
                      <BookOpen size={13} className="text-gray-300 dark:text-slate-600" />
                      <span className="text-[11px] font-semibold">{mk.materialCount || 0} Materi</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-[#0055FF] dark:group-hover:bg-blue-600 transition-colors duration-300">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 dark:text-blue-400 group-hover:text-white transition-colors">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-slate-800 transition-colors">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={30} className="text-blue-400" />
            </div>
            <h3 className="text-gray-700 dark:text-slate-300 font-bold text-lg mb-1">Mata kuliah tidak ditemukan</h3>
            <p className="text-gray-400 dark:text-slate-500 text-sm">
              {searchMatkul
                ? `Tidak ada hasil untuk pencarian "${searchMatkul}"`
                : `Belum ada mata kuliah untuk prodi ${prodiName}`}
            </p>
          </div>
        )}
      </div>

      <FooterDashboard />
    </div>
  );
}
