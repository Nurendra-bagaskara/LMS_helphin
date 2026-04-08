"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Search,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Newspaper,
  AlertCircle,
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

interface ResponsiItem {
  id: string;
  title: string;
  description: string | null;
  speaker: string | null;
  topic: string | null;
  scheduleDate: string;
  durationMinutes: number | null;
  meetingLink: string | null;
  status: string;
  mataKuliahId: string | null;
  mataKuliahName: string | null;
  prodiId: string;
  prodiName: string | null;
}

interface MataKuliahItem {
  id: string;
  name: string;
  coverUrl?: string | null;
  prodiId: string;
  prodiName: string | null;
  materialCount?: number;
}

// Warna-warna untuk banner card responsi
const responsiBannerColors = [
  "from-blue-400 to-blue-600",
  "from-cyan-400 to-cyan-600",
  "from-teal-400 to-teal-600",
  "from-sky-400 to-sky-600",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `Pukul ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} WIB`;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; prodiId?: string } | null>(null);
  const [prodiName, setProdiName] = useState("");
  const [responsiList, setResponsiList] = useState<ResponsiItem[]>([]);
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliahItem[]>([]);
  const [searchMatkul, setSearchMatkul] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const responsiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
      } catch {
        setUser({ name: "Student" });
      }
    }

    setIsMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/dashboard/stats?view=student", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store"
      });
      const data = await res.json();

      if (data.success) {
        setResponsiList(data.data.upcomingResponsi || []);
        setMataKuliahList(data.data.mataKuliah || []);
        setProdiName(data.data.prodiName || "");
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollResponsi = (direction: "left" | "right") => {
    if (responsiScrollRef.current) {
      const scrollAmount = 260;
      responsiScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const filteredMatkul = mataKuliahList.filter((mk) =>
    mk.name.toLowerCase().includes(searchMatkul.toLowerCase())
  );

  const displayedMatkul = filteredMatkul.slice(0, 8);
  const firstName = isMounted && user?.name ? user.name.split(" ")[0] : "Student";

  return (
    <div className="p-6 md:p-8 space-y-6 relative">
      {/* ==================== HERO BANNER (FIXED SVG & LAYERING) ==================== */}
      <div className="relative w-full h-[160px] md:h-[180px] rounded-2xl overflow-hidden bg-[#0055FF] shadow-sm flex items-center">
        {/* Konten Teks di Kiri (z-20 agar di paling depan) */}
        <div className="relative z-20 pl-6 md:pl-8 text-white max-w-md pointer-events-none">
          <h1 className="text-2xl md:text-[28px] font-extrabold mb-1 drop-shadow-sm leading-tight">
            Hallo, {firstName} 👋
          </h1>
          <p className="text-sm md:text-xl font-bold opacity-90 drop-shadow-sm leading-tight transition-opacity">
            Prodi {isLoading ? "..." : (prodiName || "S1 Informatika")}
          </p>
          <p className="text-[11px] md:text-xs font-medium opacity-75 mt-1 tracking-wide">by helPhin</p>
        </div>

        {/* ==================== BAGIAN VISUAL DI KANAN ==================== */}
        <div className="absolute right-0 top-0 h-full w-[55%] md:w-[45%] z-10">
          {/* Layer 1: Campus Building (z-10) */}
          <div className="absolute right-0 bottom-0 w-full h-full z-10">
            <Image
              src="/Assets/gedung_kampus_image.png"
              alt="Gedung Campus"
              fill
              className="object-cover object-right"
              priority
            />
          </div>

          {/* Layer 2: Graphical Overlays (z-20, Fixed: strokeWidth & strokeDasharray) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-40 pointer-events-none">
            <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="100" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
              <path d="M100 0 L100 200 M0 100 L200 100 M100 100 L200 200" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Layer 3: Fade Overlay (Menyambungkan gambar gedung ke background biru) */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0055FF] to-transparent z-30" />
        </div>
      </div>

        {/* ==================== RESPONSI SECTION ==================== */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 bg-gradient-to-b from-[#068DFF] to-blue-400 rounded-full"></div>
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-slate-100">Responsi</h2>
            </div>
            {responsiList.length > 3 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollResponsi("left")}
                  className="p-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <ChevronLeft size={16} className="text-gray-500 dark:text-slate-400" />
                </button>
                <button
                  onClick={() => scrollResponsi("right")}
                  className="p-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <ChevronRight size={16} className="text-gray-500 dark:text-slate-400" />
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[240px] h-64 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-gray-100 dark:border-slate-800"></div>
              ))}
            </div>
          ) : responsiList.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-10 text-center shadow-sm">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar size={24} className="text-blue-400" />
              </div>
              <p className="text-gray-500 dark:text-slate-400 font-semibold text-sm">Belum ada responsi yang akan datang</p>
              <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">Responsi dari semua mata kuliah akan tampil di sini</p>
            </div>
          ) : (
            <div
              ref={responsiScrollRef}
              className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {responsiList.map((item, idx) => {
                return (
                  <div
                    key={item.id}
                    className="min-w-[240px] max-w-[240px] bg-white dark:bg-slate-900 rounded-[20px] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:border-blue-900/50 transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Banner area */}
                    <div className={`relative h-[110px] w-full bg-[#0044CC] dark:bg-blue-950 transition-colors duration-300`}>
                      <Image
                        src="/Assets/bg_matkul.png"
                        alt="Matkul Background"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-blue-600/5 items-center"></div>
                      <div className="absolute inset-0 flex flex-col justify-center px-4">
                        <p className="text-white font-black text-lg uppercase tracking-wide drop-shadow-md">
                          {item.mataKuliahName?.split(" ")[0] || "UMUM"}
                        </p>
                        <p className="text-white/80 text-[10px] font-bold">Kini Bisa Diakses</p>
                      </div>
                      {/* Mascot */}
                      <div className="absolute right-0 bottom-0 w-[45%] h-[120%] pointer-events-none">
                        <Image
                          src="/images/Model.svg"
                          alt="Mascot"
                          fill
                          className="object-contain object-right-bottom drop-shadow-md"
                        />
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="px-4 py-3 flex-1 flex flex-col">
                      <div className="flex gap-1.5 mb-2">
                        {item.status === 'live' ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Berlangsung</span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">Berlangsung</span>
                        )}
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-500">Akan Datang</span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 leading-snug line-clamp-2 mb-3">
                        {item.title}
                      </h3>

                      <div className="space-y-1.5 text-[11px] text-gray-500 dark:text-slate-400 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                          <span className="font-medium">{formatDate(item.scheduleDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                          <span className="font-medium">{formatTime(item.scheduleDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => router.push(`/student/responsi/${item.id}`)}
                        className="w-full py-2 bg-[#068DFF] hover:bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:shadow-md hover:shadow-blue-200 transition-all active:scale-[0.97]"
                      >
                        Bergabung
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================== MATA KULIAH SECTION ==================== */}
        <section>
          {/* --- HEADER SECTION --- */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 bg-gradient-to-b from-[#068DFF] to-blue-400 rounded-full"></div>
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-slate-100">Mata Kuliah</h2>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Cari Mata Kuliah"
                value={searchMatkul}
                onChange={(e) => setSearchMatkul(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full text-xs text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-300 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all w-44"
              />
            </div>
          </div>

          {/* --- STATE HANDLING --- */}
          {isLoading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-gray-100 dark:border-slate-800"></div>
              ))}
            </div>
          ) : mataKuliahList.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-10 text-center shadow-sm">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen size={24} className="text-blue-400" />
              </div>
              <p className="text-gray-500 dark:text-slate-400 font-semibold text-sm">Belum ada mata kuliah tersedia</p>
            </div>
          ) : (
            <>
              {/* --- GRID MATA KULIAH (LIMIT 4) --- */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {/* Menggunakan slice(0, 4) untuk membatasi tampilan */}
                {displayedMatkul.slice(0, 4).map((mk) => (
                  <button
                    key={mk.id}
                    onClick={() => router.push(`/student/mata-kuliah/${mk.id}`)}
                    className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl dark:hover:border-blue-900/50 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col"
                  >
                    {/* Cover Image */}
                    <div className="relative w-full h-[110px] bg-[#0044CC] dark:bg-blue-950 overflow-hidden flex-shrink-0 transition-colors duration-300">
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
                          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 dark:bg-white/5 -translate-y-8 translate-x-8" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <BookOpen size={52} className="text-white" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-xs font-extrabold text-gray-900 dark:text-slate-100 leading-tight line-clamp-2 mb-2 group-hover:text-[#0055FF] dark:group-hover:text-blue-400 transition-colors">
                        {mk.name}
                      </h3>
                      <div className="mt-auto flex items-center justify-between border-t border-gray-50 dark:border-slate-800 pt-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <BookOpen size={11} className="text-gray-300 dark:text-slate-600" />
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500">{mk.materialCount || 0} Materi</span>
                        </div>
                        <ChevronRight size={13} className="text-gray-300 dark:text-slate-600 group-hover:text-[#0055FF] dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* --- FOOTER SECTION (Show more button) --- */}
              {/* Tombol muncul jika total data yang difilter lebih dari 4 */}
              {filteredMatkul.length > 4 && (
                <div className="text-center mt-5">
                  <button
                    onClick={() => router.push("/student/mata-kuliah")}
                    className="text-xs text-gray-500 font-medium hover:text-gray-800 transition-colors"
                  >
                    Lihat mata kuliah lainnya
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ==================== BERITA TERKINI ==================== */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-[#068DFF] to-blue-400 rounded-full"></div>
            <h2 className="text-lg font-extrabold text-gray-800 dark:text-slate-100">Berita Terkini</h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 text-center shadow-sm">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Newspaper size={24} className="text-blue-400" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-semibold text-sm">Belum ada berita terkini</p>
            <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">Berita dan pengumuman terbaru akan tampil di sini</p>
          </div>
        </section>

        {/* ==================== FOOTER BANNER ==================== */}
        <section>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#068DFF] via-[#0A7AE6] to-[#0565C8] shadow-lg">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="absolute -bottom-6 right-[25%] w-24 h-24 bg-white/5 rounded-full"></div>

            <div className="relative z-10 flex items-center justify-between px-8 md:px-10 py-7">
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg md:text-xl font-extrabold text-white">
                  Mau menjelajah materi luar prodi kamu?
                </h3>
                <p className="text-white/60 text-xs font-medium max-w-md leading-relaxed">
                  Pelajari materi di luar prodi kamu, supaya dapat ilmu lebih banyak
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/student/matkul-prodi-lain")}
                  className="px-6 py-2.5 bg-white text-blue-600 font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg hover:bg-blue-50 active:scale-[0.97] transition-all whitespace-nowrap"
                >
                  Jelajahi →
                </button>

                <div className="hidden md:block relative w-24 h-24 -mr-2">
                  <Image
                    src="/Assets/helphin_1.png"
                    alt="Helphin mascot"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FOOTER ==================== */}
        <footer className="flex items-center justify-between pt-3 pb-1 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Image
              src="/Assets/Logo-helphin-biru.png"
              alt="helPhin"
              width={70}
              height={24}
              className="object-contain opacity-50 dark:brightness-0 dark:invert"
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="text-[10px] text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 font-medium transition-colors">About</button>
            <button className="text-[10px] text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 font-medium transition-colors">Policy</button>
            <button className="text-[10px] text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 font-medium transition-colors">Terms</button>
          </div>
        </footer>

        {/* Hide scrollbar */}
        <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </div>
      );
}